import { Socket } from "socket.io";

export default class GameManager {
  socket: Socket

  constructor(socket: Socket) {
    this.socket = socket
  }
  
}