import setupServer from './lib/setupServer.js';
import GameInstance from './lib/gameInstance.js';
const { io, port, httpServer } = setupServer();

let gridSize = 10
let game = new GameInstance(gridSize, gridSize)
game.initializeGrid()

// io.on("connection", (socket) => {
  
//   socket.on("player joined", (playerId) => {

//     const playerEvent = game.addPlayer(playerId)
//     if (!playerEvent) return
//     socket.broadcast.emit("updateState", playerEvent) // sends the player joined event to all other players
//     socket.emit("state", game.getState()) // sends game to player who just joined

//     socket.on("disconnecting", async(reason) => {
//       const playerEvent = game.removePlayer(playerId)
//       if (playerEvent) socket.broadcast.emit("updateState", playerEvent) // sends disconnect event to all other players
//     })
//   })

//   socket.on("input event", (e) => {
//     const { playerId, direction } = e
//     const playerEvent = game.movePlayer(playerId, direction)
//     if (playerEvent) io.emit("updateState", playerEvent)
//   })

// });

// httpServer.listen(port, () => {
//   console.log(`Listening on port ${port}`);
// });