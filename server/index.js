import setupServer from './lib/setupServer.js';
import GameInstance from './lib/gameInstance.js';
const { io, port, httpServer } = setupServer();

let gridSize = 50
let game = new GameInstance(gridSize, gridSize)

io.on("connection", (socket) => {
  console.log("Websocket connected", `Socket id is ${socket.id}`);

  socket.on("player joined", (playerId) => {
    console.log("a player joined the game", playerId)
    io.emit("grid", game.getGrid())

    socket.on("disconnecting", async(reason) => {
      console.log("Removed a player and now here is our game state")
    })
  })


});

httpServer.listen(port, () => {
  console.log(`Listening on port ${port}`);
});