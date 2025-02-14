import { io } from "socket.io-client";
import type { Socket } from "socket.io-client"

const setupClient: Promise<{ socket: Socket; storedPlayerId: string }> = new Promise((resolve) => {

  // Get socket
  const herokuUrl = "https://thornberry-jungle-461255bc451e.herokuapp.com/"
  const tunnelUrl = "https://thornberry.loca.lt"
  let socketAddress = window.location.hostname === "localhost" ? "ws://localhost:3000" : herokuUrl
  if (window.location.hostname.includes("thornberry") && !window.location.hostname.includes("heroku")) socketAddress = tunnelUrl
  if (window.location.hostname.includes("jungle.rcdis.co")) socketAddress = "https://jungle.rcdis.co"
  if (window.location.hostname.includes("fg8ck7rs")) socketAddress = "https://fg8ck7rs-3000.use.devtunnels.ms/"
  const socket = io(socketAddress)
  let storedPlayerId: string | null = localStorage.getItem("lightweightId")

  // socket.on("connect", ()=>{
  if (storedPlayerId){
    socket.emit("player joined", storedPlayerId)
    resolve({socket, storedPlayerId});
    return
  }

  // Handle reconnections
  socket.on("connect", () => {
    if (storedPlayerId) {
      socket.emit("player joined", storedPlayerId)
    }
  })

  socket.on("assign playerId", (serverAssignedId: string) => {
    storedPlayerId = serverAssignedId
    localStorage.setItem("lightweightId", serverAssignedId)
    socket.emit("player joined", serverAssignedId)
    resolve({socket, storedPlayerId})
  })

  
})


export default setupClient