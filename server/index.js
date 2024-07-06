import setupServer from './lib/setupServer.js';
import GameInstance from './lib/gameInstance.js';
const { io, port, httpServer } = setupServer();
import gridSize from './lib/gameConfig.js';

let game = new GameInstance(gridSize, gridSize)

function parseHeader(header) {
  for (const directive of header.split(",")[0].split(";")) {
    if (directive.startsWith("for=")) {
      return directive.substring(4);
    }
  }
}

io.on("connection", (socket) => {

  // console.log("ADDRESS IS", socket.handshake.address)
  const ipAddress = parseHeader(socket.handshake.headers["forwarded"] || "");
  console.log(ipAddress);

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
    let moveEvent = game.handleInput(inputEvent)
    io.emit("update", moveEvent)
  })

})

httpServer.listen(port, () => {
  console.log(`Listening on port ${port}`);
});