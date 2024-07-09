import setupServer from './lib/setupServer.js';
import GameInstance from './lib/gameInstance.js';
import { getUserFingerPrint } from './lib/utilities.js';
const { io, port, httpServer } = setupServer();
import gridSize from './lib/gameConfig.js';

// test

let game = new GameInstance(gridSize, gridSize)

let IPs = {}

const logOffPrimaryUser = (socket) => {
  if (!IPs) return
  let userIp = getUserFingerPrint(socket)
  if (IPs[userIp] === socket.id) delete IPs[userIp]
  delete IPs[userIp]
}

export const isUserPrimary = (socket) => {

  if (!IPs) return

  if (!socket.handshake.headers['x-forwarded-for']) return true
  let userIp = getUserFingerPrint(socket)

  if (!userIp) return true

    // If no record, or record of active IP has been deleted, set current user as primary user of IP and let them vibe
    if (!IPs[userIp]){
      console.log("User action accepted")
      IPs[userIp] = socket.id
      return true
    }

    // If there is a record, and it's already the current user, let them vibe
    if (IPs[userIp] === socket.id){
      console.log("User action accepted")
      return true
    }
    
    // If a record but not the current user's socket, don't let them vibe
    if (IPs[userIp] && IPs[userIp] !== socket.id){
      socket.emit("redundant connection", "redundant connection")
      console.log("User action rejected - you are late to the party")
      return false
    }

}

io.on("connection", (socket) => {

  socket.on("player joined", (playerId) => {
    if (!isUserPrimary(socket)) return
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
    if (!isUserPrimary(socket)) return
    let moveEvent = game.handleInput(inputEvent)
    io.emit("update", moveEvent)
  })

})

httpServer.listen(port, () => {
  console.log(`Listening on port ${port}`);
});