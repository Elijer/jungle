import setupServer from './lib/setupServer.js';
import GameInstance from './lib/gameInstance.js';
const { io, port, httpServer } = setupServer();

let gridSize = 20
let game = new GameInstance(gridSize, gridSize)

io.on("connection", (socket) => {

  socket.on("player joined", (playerId) => {
    console.log("player", playerId.substring(0, 4) + '...', "joined")
    // socket.broadcast.emit("updateState", playerEvent) // sends the player joined event to all other players
    socket.emit("state", game.getState()) // sends game to player who just joined
  })

})

httpServer.listen(port, () => {
  console.log(`Listening on port ${port}`);
});