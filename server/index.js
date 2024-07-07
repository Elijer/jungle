import setupServer from './lib/setupServer.js';
import GameInstance from './lib/gameInstance.js';
const { io, port, httpServer } = setupServer();
import gridSize from './lib/gameConfig.js';

let game = new GameInstance(gridSize, gridSize)

let ips = {}

const getUserFingerPrint = (socket) => {
  let userIp = socket.handshake.headers['x-forwarded-for']
  let browser = socket.handshake.headers['user-agent']
  let browser2 = socket.handshake.headers['sec-ch-ua']
  let platform = socket.handshake.headers['sec-ch-ua-platform']
  let mobile = socket.handshake['sec-ch-ua-mobile']
  return userIp + browser + browser2 + platform + mobile
}

const logOffPrimaryUser = (socket) => {
  // let userIp = socket.handshake.headers['x-forwarded-for']
  let userIp = getUserFingerPrint(socket)
  if (ips[userIp] === socket.id) delete ips[userIp]
  delete ips[userIp]
}

export const isUserPrimary = (socket) => {
  console.log("Fingerprint: ", getUserFingerPrint(socket))
  console.log("Printing headers")
  console.log(socket.handshake.headers)
  console.log("address is", socket.handshake.address)
  console.log("while ip is", socket.handshake.headers['x-forwarded-for'])
  if (!socket.handshake.headers['x-forwarded-for']) return true
  // let userIp = socket.handshake.headers['x-forwarded-for']
  let userIp = getUserFingerPrint(socket)

  if (!userIp) return true

    // If no record, or record of active IP has been deleted, set current user as primary user of IP and let them vibe
    if (!ips[userIp]){
      console.log("User action accepted")
      ips[userIp] = socket.id
      return true
    }

    // If there is a record, and it's already the current user, let them vibe
    if (ips[userIp] === socket.id){
      console.log("User action accepted")
      return true
    }
    
    // If a record but not the current user's socket, don't let them vibe
    if (ips[userIp] && ips[userIp] !== socket.id){
      console.log("test")
      socket.emit("redundant connection", "redundant connection")
      console.log("User action rejected - you are late to the party")
      return false
    }

}

io.on("connection", (socket) => {

  console.log("User with IP of", socket.handshake.headers['x-forwarded-for'], "just connected")
  // This exists on disco, but not locally

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