import setupServer from './lib/setupServer.js';
import GameInstance from './lib/gameInstance.js';
const { io, port, httpServer } = setupServer();

let gridSize = 10
let game = new GameInstance(gridSize, gridSize)
// let socketIds = {} // only needed if we need to save sockets ids for later use

io.on("connection", (socket) => {
  // console.log("Websocket connected", `Socket id is ${socket.id}`);
  
  socket.on("player joined", (playerId) => {

    const playerEvent = game.addPlayer(playerId)

    socket.emit("state", game.getState()) // sends game to player who just joined
    socket.broadcast.emit("updateState", playerEvent) // sends the player joined event to all other players

    socket.on("disconnecting", async(reason) => {
      const playerEvent = game.removePlayer(playerId)
      console.log("Removed a player")
      socket.broadcast.emit("updateState", playerEvent) // sends disconnect event to all other players
    })
  })

  socket.on("input event", (e) => {
    const { playerId, direction } = e
    const playerEvent = game.movePlayer(playerId, direction)
    io.emit("updateState", playerEvent) // this could be a broadcast if players' own movement is handled locally
  })

});

httpServer.listen(port, () => {
  console.log(`Listening on port ${port}`);
});