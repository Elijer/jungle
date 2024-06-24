import setupServer from './lib/setupServer.js';
import GameInstance from './lib/gameInstance.js';
const { io, port, httpServer } = setupServer();

let gridSize = 10
let game = new GameInstance(gridSize, gridSize)

io.on("connection", (socket) => {
  console.log("Websocket connected", `Socket id is ${socket.id}`);

  socket.on("player joined", (playerId) => {
    console.log("a player joined the game", playerId)
    game.addPlayer(playerId)
    io.emit("grid", game.getGrid())

    socket.on("disconnecting", async(reason) => {
      game.removePlayer(playerId)
      console.log("Removed a player")
    })
  })

  socket.on("input event", (e) => {
    const { playerId, direction } = e
    game.movePlayer(playerId, direction)
    io.emit("grid", game.getGrid())
  })

});

httpServer.listen(port, () => {
  console.log(`Listening on port ${port}`);
});