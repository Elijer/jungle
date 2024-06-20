import setupServer from './lib/setupServer.js';

const { io, port, httpServer } = setupServer();

io.on("connection", (socket) => {
  console.log("Websocket connected", `Socket id is ${socket.id}`);

  socket.on("message", (msg) => {
    console.log("Message received:", msg);
    io.emit("hi", msg + " -> signed by server");
  });

  socket.on("player joined", (playerId) => {
    console.log("a player joined the game", playerId)
    io.emit("player joined", playerId)

    socket.on("disconnecting", async(reason) => {
      console.log("Removed a player and now here is our game state")
    })
  })


});

httpServer.listen(port, () => {
  console.log(`Listening on port ${port}`);
});