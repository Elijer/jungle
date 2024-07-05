import setupServer from './lib/setupServer.js';
import GameInstance from './lib/gameInstance.js';
const { io, port, httpServer } = setupServer();
import gridSize from './lib/gameConfig.js';

let game = new GameInstance(gridSize, gridSize)

io.on("connection", (socket) => {

  socket.on("player joined", (playerId) => {
    console.log("player", playerId.substring(0, 4) + '...', "joined")

    let addedPlayerToGame = game.playerOnlineOrAddPlayer(playerId)
    socket.broadcast.emit("update", addedPlayerToGame) // sends the player joined event to all other players
    socket.emit("state", game.getState()) // sends game to player who just joined

    socket.on("disconnecting", async(reason) => {
      const playerEvent = game.playerOffline(playerId)
      if (playerEvent) socket.broadcast.emit("update", playerEvent) // sends disconnect event to all other players
    })
  })

  socket.on("input event", (inputEvent) => {
    game.handleInput(inputEvent)
    // console.log("input event", inputEvent)
  })

})

httpServer.listen(port, () => {
  console.log(`Listening on port ${port}`);
});