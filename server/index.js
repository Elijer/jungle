import setupServer from './lib/setupServer.js';
import GameInstance from './lib/gameInstance.js';
const { io, port, httpServer } = setupServer();
import { gridSize, refreshRadius } from './lib/gameConfig.js';
import { isUserLegit, logOffPrimaryUser } from './lib/userManagement.js';
import { log } from './lib/logger.js';

let game = new GameInstance(gridSize, gridSize, refreshRadius)

export const STREAM_MODE = {
  LOCAL: "LOCAL",
  INITIAL_GLOBAL: "INITIAL_GLOBAL_THEN_LOCAL_UPDATES" // <--- THIS IS BETTER FOR DEBUGGING THE ENTIRE MAP
}

export const serverConfig = {
  // streamMode: STREAM_MODE.INITIAL_GLOBAL
  streamMode: STREAM_MODE.LOCAL
}

io.on("connection", (socket) => {

  socket.emit("config", serverConfig)

  socket.on("player joined", (playerId) => {
    log(`${playerId.substring(0, 4)} [joined]`)
    if (!isUserLegit(socket)) return

    let addedPlayerToGame = game.playerOnlineOrAddPlayer(playerId)
    if (!addedPlayerToGame) return // if there is no space
    // This should only be sent to players who are currently in whatever radius we have set for state updates

    switch(serverConfig.streamMode){
      case(STREAM_MODE.INITIAL_GLOBAL):
        socket.emit("state", game.getState()) // sends game to player who just joined
        socket.broadcast.emit("update", addedPlayerToGame) // sends the player joined event to all other players, only necessary with initial_global I think???
        break
      case(STREAM_MODE.LOCAL):
        // Instead, I want to send over just the players local squares, AND the size of the map.
        // This can be just slightly different than normal.
        {
          let { x, y } = addedPlayerToGame.position
          socket.emit("localState", game.getLocalState(x, y)) // <-- I think this is just the player getting the local state
          break
      }
    }

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
    if (!moveEvent) return
    let { x, y } = moveEvent.position
    
    switch(serverConfig.streamMode){
      case(STREAM_MODE.INITIAL_GLOBAL):
        io.emit("update", moveEvent) // So this should be batched <--- this is the thing that sends move events
        break
      case(STREAM_MODE.LOCAL):
        socket.emit("localState", game.getLocalState(x, y))
        // socket.broadcast.emit('update', moveEvent) // I think this broadcasts to the other players? BUT. I am no longer using update
        // for the localState stream_mode on the client. I could, but I'm not right now. So I would need to change this.
        break
    }
  })

})

httpServer.listen(port, () => {
  log(`-->>> STARTED SERVER: ${port} <<<--`)
  console.log(`Listening on port ${port}`);
});