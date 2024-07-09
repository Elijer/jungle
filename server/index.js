import setupServer from './lib/setupServer.js';
import GameInstance from './lib/gameInstance.js';
import { getUserFingerPrint } from './lib/utilities.js';
const { io, port, httpServer } = setupServer();
import gridSize from './lib/gameConfig.js';

let game = new GameInstance(gridSize, gridSize)

let IPs = {}
let sampleWindow = 1000
let requestLimit = 12

const logOffPrimaryUser = (socket) => {
  let userIp = getUserFingerPrint(socket)
  if (IPs[userIp] && IPs[userIp].id === socket.id) delete IPs[userIp].id
}

// Limit only one IP/user agent per socket, and also limit rate of requests
export const isUserLegit = (socket) => {

  let now = Date.now()

  if (!socket.handshake.headers['x-forwarded-for']) return true // local host
  let userIp = getUserFingerPrint(socket)

  if (!userIp) return true

    // No record of user fingerprint exists; create one
    if (!IPs[userIp] || !IPs[userIp].requests || !IPs[userIp].lastRequest){
      IPs[userIp] = {
        id: socket.id,
        requests: 0,
        lastRequest: now
      }
      IPs[userIp].requests++
      return true
    }

    let userRecord = IPs[userIp]

    // If a record but not the current user's socket, don't let them vibe
    if (userRecord && userRecord.id && userRecord.id !== socket.id){
      socket.emit("redundant connection", "redundant connection")
      console.log("User action rejected - you are late to the party")
      return false
    }

    if (now - userRecord.lastRequest > sampleWindow){
      userRecord.requests = 1
      userRecord.lastRequest = now
      console.log("User action accepted - new sample window")
      return true
    }

    if (userRecord.requests >= requestLimit) {
      socket.emit("rate limit exceeded", "rate limit exceeded")
      console.log("User action rejected - rate limit exceeded")
      return false
    }

    userRecord.requests++
    console.log("User action accepted")
    return true

}

io.on("connection", (socket) => {

  socket.on("player joined", (playerId) => {
    if (!isUserLegit(socket)) return
    console.log("player", playerId.substring(0, 4) + '...', "joined")

    let addedPlayerToGame = game.playerOnlineOrAddPlayer(playerId)
    socket.broadcast.emit("update", addedPlayerToGame) // sends the player joined event to all other players
    socket.emit("state", game.getState()) // sends game to player who just joined

    socket.on("disconnecting", async(reason) => {
      logOffPrimaryUser(socket)
      const playerEvent = game.playerOffline(playerId)
      if (playerEvent) socket.broadcast.emit("update", playerEvent) // sends disconnect event to all other players
    })
  })

  socket.on("input event", (inputEvent) => {
    if (!isUserLegit(socket)) return
    let moveEvent = game.handleInput(inputEvent)
    io.emit("update", moveEvent)
  })

})

httpServer.listen(port, () => {
  console.log(`Listening on port ${port}`);
});