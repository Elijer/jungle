import { io } from "socket.io-client";
import { v4 as uuidv4 } from 'uuid';

const setupClient = () => {
  const herokuUrl = "https://thornberry-jungle-461255bc451e.herokuapp.com/"
  const socketAddress = window.location.hostname === "localhost" ? "ws://localhost:3000" : herokuUrl
  const socket = io(socketAddress)
  
  const playerId = () => localStorage.getItem('playerId') || localStorage.setItem('playerId', uuidv4())
  
  socket.on("connect", () => {
    console.log("Connected")
    socket.emit("player joined", playerId())
  });

  return socket
}

export default setupClient