import setupServer from './lib/setupServer.js';
import GameInstance from './lib/gameInstance.js';
import path from 'path';
const { io, port, httpServer } = setupServer();
import gridSize from './lib/gameConfig.js';
import { isUserLegit, logOffPrimaryUser } from './lib/userManagement.js';
import Logger from './lib/logger.js';
import { dirname } from './lib/utilities.js';

let game = new GameInstance(gridSize, gridSize)
const log = new Logger(path.join(dirname(), 'app.log')); 

io.on("connection", (socket) => {

  socket.on("player joined", (playerId) => {
    console.log("player joined with id of: ", playerId)
    if (!isUserLegit(socket)) return
    console.log("player", playerId.substring(0, 4) + '...', "joined")

    let addedPlayerToGame = game.playerOnlineOrAddPlayer(playerId)
    if (!addedPlayerToGame) return // if there is no space
    socket.broadcast.emit("update", addedPlayerToGame) // sends the player joined event to all other players
    socket.emit("state", game.getState()) // sends game to player who just joined

    socket.on("disconnecting", async(reason) => {
      console.log("player disconnected with id: ", playerId)
      logOffPrimaryUser(socket)
      const playerEvent = game.playerOffline(playerId)
      if (playerEvent) socket.broadcast.emit("update", playerEvent) // sends disconnect event to all other players
    })
  })

  socket.on("input event", (inputEvent) => {

    console.log("Input event received: ", inputEvent)

    if (!isUserLegit(socket)) return
    let moveEvent = game.handleInput(inputEvent)
    io.emit("update", moveEvent) // So this should be batched
  })

})

httpServer.listen(port, () => {
  console.log(`Listening on port ${port}`);
});