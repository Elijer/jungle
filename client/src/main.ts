import * as THREE from 'three';

import setupClient from './lib/setupClient.js'
import sceneSetup from './lib/sceneSetup.js'
import { SomeSynth } from './lib/sound.js';
import Lerper from './lib/gameClasses/Lerper.js'
import { BoardState, CubeForHire, LerpConfig, TileState, Players, KeyBindings } from './interfaces.js'
import './style.css'

const lerper = new Lerper()

const config = {
  fun: {
    speedCeiling: 7,
  }
}

// Fun Mode
let speed = 1
let funMode = false

let funButton = document.getElementById("fun-mode")
funButton?.addEventListener("click", () => {
  funMode = !funMode
  funButton.innerHTML = funMode ? "woah now" : "fun mode"
})

let fpsInterval: number, startTime, now, then: number, elapsed;

const someSynth = new SomeSynth()

const { socket, playerId } = setupClient()
let { scene, camera, renderer, b, composer, pixelPass } = sceneSetup(funMode, speed)

let activeCubes: CubeForHire[] = []
let inactiveCubes: CubeForHire[] = []

let ephemerals = new THREE.Group();
scene.add(ephemerals)
let lastGrid: any = []

let players: Players | {} = {}

const newCubeGeometry = new THREE.BoxGeometry(b.squareSize, b.squareSize, b.squareSize);

const createCube = () => {
  const newCubeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

  return {
    active: true,
    geometry: newCubeGeometry,
    material: newCubeMaterial,
    cube: new THREE.Mesh(newCubeGeometry, newCubeMaterial)
  }
}

const addCube = (x: number, y: number, color: number | undefined, opacity: number = 1.0) => {

  let c = inactiveCubes.pop()

  if (c){
    c.active = true
    ephemerals.add(c.cube)
    activeCubes.push(c)
  }

  if (!c) {
    c = createCube()
    activeCubes.push(c)
  }

  c.material.transparent = true

  if (c.material.color.getHex() !== color) {
    c.material.color.setHex(color);
  }

  // Only set opacity as needed
  if (c.material.opacity !== opacity) {
    c.material.transparent = opacity < 1.0; // Only set transparency if opacity is less than 1.0
    c.material.opacity = opacity;
  }

  c.cube.position.set(
    x * (b.squareSize + b.gapSize) - b.gridSize / 2,
    y * (b.squareSize + b.gapSize) - b.gridSize + 1,
    .5
  );

  ephemerals.add(c.cube);
  
}

socket.on("state", (boardState: BoardState) => {

  let grid: TileState[][] = boardState.grid
  players = boardState.players

  ephemerals.remove(...ephemerals.children)
  inactiveCubes.concat(...activeCubes)
  activeCubes = []

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
        addCube(x, y, parseInt("0x" + grid[x][y].spaceLayer?.color), 1.0)
      }

      if (grid[x][y].spiritLayer?.geometry === "cube"){
        addCube(x, y, parseInt("0x" + grid[x][y].spiritLayer?.color), .05)
      }

    }
  }
  lastGrid = grid
})

let animate = () => {

  if (funMode){
    pixelPass.setPixelSize(8 * speed)
  } else {
    pixelPass.setPixelSize(1)
  }

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

    if (speed > 1) speed/=1.1

    then = now - (elapsed % fpsInterval);
  }

}

// requestAnimationFrame(animate)
function animationThrottler(fps: number) {
  fpsInterval = 1000 / fps;
  then = Date.now();
  startTime = then;
  animate();
}

animationThrottler(24)

document.addEventListener('DOMContentLoaded', () => {
  
  // Buttons
  document.addEventListener("keydown", (event) => {
    if (funMode) handleMovement(event)
  });

  document.addEventListener("keyup", (event) => {
    if (!funMode) handleMovement(event)
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

const handleMovement = (event: KeyboardEvent) => {
  someSynth.initializeAudio()
  if (socket.connected === false) return
  const keyName = event.key.toLowerCase();

  const directions: { [key: string]: string } = {
    w: "u",
    a: "l",
    s: "d",
    d: "r"
  };

  if (directions.hasOwnProperty(keyName)) {
    if (speed < config.fun.speedCeiling) speed*=1.2
    let volVal = (3 * (speed)) - 30
    if (funMode) someSynth.playNoteAtVolume(1 - (speed * 100), volVal)
    socket.emit("input event", { playerId: playerId, direction: directions[keyName] });
  }
}