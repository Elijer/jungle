import * as THREE from 'three';

import setupClient from './lib/setupClient.js'
import sceneSetup from './lib/sceneSetup.js'
import Lerper from './lib/gameClasses/Lerper.js'
import CubeManager from './lib/gameClasses/CubeManager.js'
import handleMovement from './lib/gameClasses/handleMovement.js'
import { BoardState, TileState, Players, KeyBindings, UpdateState } from './interfaces.js'
import './style.css'

const lerper = new Lerper()

let initialGridRecieved = false

let fpsInterval: number, startTime, now, then: number, elapsed;

const { socket, playerId } = setupClient()
let { scene, camera, renderer, b, composer, pixelPass } = sceneSetup()

let ephemerals = new THREE.Group();
scene.add(ephemerals)

let cubes = new CubeManager(b, ephemerals)

let lastGrid: any = []

let players: Players | { [key: string]: any } = {}

socket.on("updateState", (updatedState: UpdateState) => {
  console.log("updatedState", updatedState)
  if (!initialGridRecieved || !updatedState) return
  if (updatedState.action === "move"){
    console.log(updatedState)
    cubes.moveCube(updatedState.playerId, {x: updatedState.x, y: updatedState.y})
    // so all this does is move a RENDERED cube, but I also have to change the cube in the local grid, which isn't getting changed

    if (players[updatedState.playerId]){
      players[updatedState.playerId] = { x: updatedState.x, y: updatedState.y }
    }
  }

  if (updatedState.action === "add"){
    cubes.addCube(updatedState.x, updatedState.y, updatedState.color, updatedState.playerId)
  }
})

// ANIMATION LOOP
let animate = () => {

  requestAnimationFrame(animate)

  // if (!document.hasFocus()) return // to prevent crashing in the background

  now = Date.now()
  elapsed = now - then
  if (elapsed > fpsInterval){

    let playerId = localStorage.getItem('playerId')
    if (playerId && players && (players as Players)[playerId]){
      let {x, y } = (players as Players)[playerId]
      lerper.lerp(x, y, b.gridSize, camera)
    }
  
    composer.render()

    then = now - (elapsed % fpsInterval);
  }

}

function animationThrottler(fps: number, animationFunction: Function) {
  fpsInterval = 1000 / fps;
  then = Date.now();
  startTime = then;
  animationFunction();
}

animationThrottler(24, animate)

// INTERACTION
document.addEventListener('DOMContentLoaded', () => {

  document.addEventListener("keyup", (event) => {
    handleMovement(socket, playerId)(event)
  });

  const keyBindings: KeyBindings = {
    "w": { element: document.getElementById('up-button')!, code: 'u' },
    "a": { element: document.getElementById('left-button')!, code: 'l' },
    "s": { element: document.getElementById('down-button')!, code: 'd' },
    "d": { element: document.getElementById('right-button')!, code: 'r' },
};
  
  for (const key of Object.keys(keyBindings)) {
    const keyBinding = keyBindings[key];
    keyBinding.element.addEventListener('touchend', () => {
      socket.emit('input event', { playerId: playerId, direction: keyBinding.code });
    });
  }

  // HANDLE LOCAL STATE
  socket.on("state", (boardState: BoardState) => {

    let grid: TileState[][] = boardState.grid
    initialGridRecieved = true
    players = boardState.players

    ephemerals.remove(...ephemerals.children)
    cubes.inactive.concat(...cubes.active)
    cubes.active = []

    for (let x = 0; x < b.gridSize; x++) {
      for (let y = 0; y < b.gridSize; y++) {
        const index = x * b.gridSize + y;
        if (lastGrid.length > 1 && lastGrid[x][y].terrain === grid[x][y].terrain){
          //
        } else {
          let color = "0x" + grid[x][y].terrain
          b.terrainTiles[index].color.setHex(color);
        }

        if (grid[x][y].spaceLayer?.geometry === "cube"){
          let item = grid[x][y].spaceLayer
          cubes.addCube(x, y, parseInt("0x" + item?.color), 1.0, item?.id)
        }

        if (grid[x][y].spiritLayer?.geometry === "cube"){
          let item = grid[x][y].spaceLayer
          cubes.addCube(x, y, parseInt("0x" + item?.color), .05, item?.id)
        }

      }
    }
    lastGrid = grid
  })
})