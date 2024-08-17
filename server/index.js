import setupServer from './lib/setupServer.js';
import GameInstance from './lib/gameInstance.js';
const { io, port, httpServer } = setupServer();
import gridSize from './lib/gameConfig.js';
import { isUserLegit, logOffPrimaryUser } from './lib/userManagement.js';
import { log } from './lib/logger.js';

let game = new GameInstance(gridSize, gridSize)

io.on("connection", (socket) => {

  socket.on("player joined", (playerId) => {
    log(`${playerId.substring(0, 4)} [joined]`)
    if (!isUserLegit(socket)) return

  let addedPlayerToGame = game.playerOnlineOrAddPlayer(playerId)
    if (!addedPlayerToGame) return // if there is no space
    socket.broadcast.emit("update", addedPlayerToGame) //// sends the player joined event to all other players
    // This should only be sent to players who are currently in whatever radius we have set for state updates

    // socket.emit("state", game.getState()) // sends game to player who just joined
    // Instead, I want to send over just the players local squares, AND the size of the map.
    // This can be just slightly different than normal.
    socket.emit("localState", game.getLocalState())

    socket.on("disconnecting", async(reason) => {
      log(`${playerId.substring(0, 4)} [disconnected]: ${reason}`)
      logOffPrimaryUser(socket)
      const playerEvent = game.playerOffline(playerId)
      if (playerEvent) socket.broadcast.emit("update", playerEvent) // sends disconnect event to all other players
    })
  })

  socket.on("input event", (inputEvent) => {
    log(`${inputEvent.playerId.substring(0, 4)} [input]: ${inputEvent.command}`)

    if (!isUserLegit(socket)) return
    let moveEvent = game.handleInput(inputEvent)
    io.emit("update", moveEvent) // So this should be batched
  })

})

httpServer.listen(port, () => {
  log(`-->>> STARTED SERVER: ${port} <<<--`)
  console.log(`Listening on port ${port}`);
});