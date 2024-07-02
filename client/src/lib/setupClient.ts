import { io } from "socket.io-client";
import { v4 as uuidv4 } from 'uuid';

const setupClient = () => {

  if (!localStorage.getItem('playerId')) localStorage.setItem('playerId', uuidv4())
  const playerId = localStorage.getItem('playerId')

  const herokuUrl = "https://thornberry-jungle-461255bc451e.herokuapp.com/"
  const tunnelUrl = "https://thornberry.loca.lt"
  let socketAddress = window.location.hostname === "localhost" ? "ws://localhost:3000" : herokuUrl
  if (window.location.hostname.includes("thornberry") && !window.location.hostname.includes("heroku")) socketAddress = tunnelUrl
  if (window.location.hostname.includes("jungle.rcdis.co")) socketAddress = "https://jungle.rcdis.co"
  const socket = io(socketAddress)
  
  socket.on("connect", () => {
    console.log("Connected")
    socket.emit("player joined", playerId)
  });

  return { socket, playerId }
}

export default setupClient