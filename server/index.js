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

function updateSubscriptions(socket, existingSubscriptionsSet, newSubscriptions) {
  const roomsToLeave = [...existingSubscriptionsSet].filter(tile=>!newSubscriptions.includes(tile))
  const roomsToJoin = newSubscriptions.filter(tile=> !existingSubscriptionsSet.has(tile))

  roomsToLeave.forEach(tile =>{
    existingSubscriptionsSet.delete(tile)
    socket.leave(`tile-${tile}`)
  })

  roomsToJoin.forEach(tile => {
    existingSubscriptionsSet.add(tile)
    socket.join(`tile-${tile}`)
  })
  
}

io.on("connection", (socket) => {

  const existingSubscriptionsSet = new Set()

  socket.emit("assign playerId", game.createLightweightId())

  socket.emit("config", serverConfig)

  socket.on("player joined", (playerId) => {

    log(`${playerId} [joined]`)
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

        {
          let { x, y } = addedPlayerToGame.position
          const { tileNumbers: newSubscriptions, payload: localState } =  game.getLocalState(x, y)
          updateSubscriptions(socket, existingSubscriptionsSet, newSubscriptions)
          socket.emit("localState", localState) // <-- I think this is just the player getting the local state
          break
      }
    }

    socket.on("disconnecting", async(reason) => {
      log(`${playerId} [disconnected]: ${reason}`)
      logOffPrimaryUser(socket)
      const playerEvent = game.playerOffline(playerId)
      if (playerEvent) socket.broadcast.emit("update", playerEvent) // sends disconnect event to all other players
    })

    socket.on("input event", (inputEvent) => {
      log(`${inputEvent.playerId} [input]: ${inputEvent.command}`)
  
      if (!isUserLegit(socket)) return
      let moveEvent = game.handleInput(inputEvent)
      if (!moveEvent) return
      let { x, y } = moveEvent.position
      
      switch(serverConfig.streamMode){
        case(STREAM_MODE.INITIAL_GLOBAL):
          io.emit("update", moveEvent) // So this should be batched <--- this is the thing that sends move events
          break
        case(STREAM_MODE.LOCAL):
          {
          const { tileNumbers: newSubscriptions, payload: localState } =  game.getLocalState(x, y)
          updateSubscriptions(socket, existingSubscriptionsSet, newSubscriptions)
  
          // send out individual tile updates to any other sockets currently subscribed to them
          for (const update of moveEvent.updates){
            socket.broadcast.to(`tile-${update.tileNumber}`).emit("tileUpdate", update)
          }
  
          socket.emit("localState", localState)
  
          break
          }
      }
    })
  })

})

httpServer.listen(port, () => {
  log(`-->>> STARTED SERVER: ${port} <<<--`)
  console.log(`Listening on port ${port}`);
});