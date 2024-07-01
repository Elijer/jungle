import * as THREE from 'three';

import setupClient from './lib/setupClient.js'
import sceneSetup from './lib/sceneSetup.js'
import { SomeSynth } from './lib/sound.js';
import Lerper from './lib/gameClasses/Lerper.js'
import CubeManager from './lib/gameClasses/CubeManager.js'
import FunMode from './lib/gameClasses/FunMode.js'
import handleMovement from './lib/gameClasses/handleMovement.js'
import { BoardState, TileState, Players, KeyBindings } from './interfaces.js'
import './style.css'

const lerper = new Lerper()
const someSynth = new SomeSynth()

let fpsInterval: number, startTime, now, then: number, elapsed;

const { socket, playerId } = setupClient()
let { scene, camera, renderer, b, composer, pixelPass } = sceneSetup()

const fun = new FunMode(pixelPass, handleMovement(socket, playerId), someSynth)

let ephemerals = new THREE.Group();
let cubes = new CubeManager(b)

scene.add(ephemerals)
let lastGrid: any = []

let players: Players | {} = {}

// HANDLE LOCAL STATE
socket.on("state", (boardState: BoardState) => {

  let grid: TileState[][] = boardState.grid
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
        let pos = grid[x][y]
        cubes.addCube(x, y, parseInt("0x" + pos.spaceLayer?.color), 1.0, ephemerals)
      }

      if (grid[x][y].spiritLayer?.geometry === "cube"){
        let pos = grid[x][y]
        cubes.addCube(x, y, parseInt("0x" + pos.spiritLayer?.color), .05, ephemerals)
      }

    }
  }
  lastGrid = grid
})

// ANIMATION LOOP
let animate = () => {

  fun.pixelateBySpeed()

  requestAnimationFrame(animate)

  if (!document.hasFocus()) return // to prevent crashing in the background

  now = Date.now()
  elapsed = now - then
  if (elapsed > fpsInterval){

    let playerId = localStorage.getItem('playerId')
    if (playerId && players && (players as Players)[playerId]){
      let {x, y } = (players as Players)[playerId]
      lerper.lerp(x, y, b.gridSize, camera)
    }
  
    composer.render()

    if (fun.speed > 1) fun.speed/=1.1

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
})