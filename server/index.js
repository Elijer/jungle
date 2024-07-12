import setupServer from './lib/setupServer.js';
import GameInstance from './lib/gameInstance.js';
const { io, port, httpServer } = setupServer();
import gridSize from './lib/gameConfig.js';
import { isUserLegit, logOffPrimaryUser } from './lib/userManagement.js';

let game = new GameInstance(gridSize, gridSize)

let changesOnQueue = []

io.on("connection", (socket) => {

  socket.on("player joined", (playerId) => {
    if (!isUserLegit(socket)) return
    console.log("player", playerId.substring(0, 4) + '...', "joined")

    let addedPlayerToGame = game.playerOnlineOrAddPlayer(playerId)
    if (!addedPlayerToGame) return // if there is no space
    socket.broadcast.emit("update", addedPlayerToGame) // sends the player joined event to all other players
    socket.emit("state", game.getState()) // sends game to player who just joined

    socket.on("disconnecting", async(reason) => {
      logOffPrimaryUser(socket)
      const playerEvent = game.playerOffline(playerId)
      if (playerEvent) socket.broadcast.emit("update", playerEvent) // sends disconnect event to all other players
    })
  })

  socket.on("input event", (inputEvent) => {

    // two optimizations -
    // The easiest is probably to emit in batches
    // - one is to batch handleInput
    // - another is to only send updates to players who are close to those who moved

    if (!isUserLegit(socket)) return
    let moveEvent = game.handleInput(inputEvent)
    io.emit("update", moveEvent) // So this should be batched
  })

})

httpServer.listen(port, () => {
  console.log(`Listening on port ${port}`);
});