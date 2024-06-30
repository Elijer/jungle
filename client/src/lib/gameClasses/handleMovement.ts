import type { Socket } from 'socket.io-client'
import FunMode from './FunMode.js'

const handleMovement = (socket: Socket, playerId: string | null) => (event: KeyboardEvent, fun: FunMode | null = null) => {
  if (socket.connected === false || !playerId) return
  const keyName = event.key.toLowerCase();

  const directions: { [key: string]: string } = {
    w: "u",
    a: "l",
    s: "d",
    d: "r"
  };

  if (directions.hasOwnProperty(keyName)) {
    if (fun){
      fun.playSpeedSynth()
    }
    socket.emit("input event", { playerId: playerId, direction: directions[keyName] });
  }
}

export default handleMovement