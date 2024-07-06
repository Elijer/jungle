import setupServer from './lib/setupServer.js';
import GameInstance from './lib/gameInstance.js';
const { io, port, httpServer } = setupServer();
import gridSize from './lib/gameConfig.js';

let game = new GameInstance(gridSize, gridSize)

let userIp
let activeUsers = new Set()

io.on("connection", (socket) => {

  // console.log("ADDRESS IS", socket.handshake.address)
  // const ipAddress = parseHeader(socket.handshake.headers["forwarded"] || "");
  // console.log("THe IP aderess is...", ipAddress);
  console.log("thing", socket.handshake.headers['x-forwarded-for'])
  // This exists on disco, but not locally
  if (socket.handshake.headers['x-forwarded-for']){
    userIp = socket.handshake.headers['x-forwarded-for']
    activeUsers.add(userIp)
    if (activeUsers.has(userIp)){
      socket.disconnect()
    }
  }

  socket.on("player joined", (playerId) => {
    console.log("player", playerId.substring(0, 4) + '...', "joined")

    let addedPlayerToGame = game.playerOnlineOrAddPlayer(playerId)
    socket.broadcast.emit("update", addedPlayerToGame) // sends the player joined event to all other players
    socket.emit("state", game.getState()) // sends game to player who just joined

    socket.on("disconnecting", async(reason) => {
      if (userIp) activePlayers.delete(userIp)
      const playerEvent = game.playerOffline(playerId)
      if (playerEvent) socket.broadcast.emit("update", playerEvent) // sends disconnect event to all other players
    })
  })

  socket.on("input event", (inputEvent) => {
    let moveEvent = game.handleInput(inputEvent)
    io.emit("update", moveEvent)
  })

})

httpServer.listen(port, () => {
  console.log(`Listening on port ${port}`);
});