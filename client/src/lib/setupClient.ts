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
  if (window.location.hostname.includes("fg8ck7rs")) socketAddress = "https://fg8ck7rs-3000.use.devtunnels.ms/"
  const socket = io(socketAddress)
  
  socket.on("connect", () => {
    console.log("Connected as player", playerId?.substring(0, 4))
    socket.emit("player joined", playerId)
  });

  socket.on("redundant connection", () => {
    alert("You are already connected in another tab, or device on this IP address.")
  })

  return { socket, playerId }
}


export default setupClient