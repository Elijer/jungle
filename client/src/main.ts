import * as THREE from 'three';
import { thousands, memoryCrashAvoider, memoryCheck } from './lib/utils.js'

// Post processing
import Composer from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { BoardState, CubeForHire, LerpConfig } from './interfaces.js'
import type { Players } from './interfaces.js'

import './style.css'
import { TileState } from './interfaces.js'

import setupClient from './lib/setupClient.js'
import sceneSetup from './lib/sceneSetup.js'

memoryCheck()

const { socket, playerId } = setupClient()
let { scene, camera, renderer, b } = sceneSetup()

let cubesForHire: CubeForHire[] = []

let ephemerals = new THREE.Group();
scene.add(ephemerals)
let lastGrid: any = []

let lerp: LerpConfig = {
  start: null,
  duration: 1500,
  startPos: { x: 0, y: 0 },
  targetPos: { x: 0, y: 0 }
};

let players: Players | {} = {}

const createCube = () => {
  const newCubeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const newCubeGeometry = new THREE.BoxGeometry(b.squareSize, b.squareSize, b.squareSize);

  return {
    active: true,
    geometry: newCubeGeometry,
    material: newCubeMaterial,
    cube: new THREE.Mesh(newCubeGeometry, newCubeMaterial)
  }
}

const addCube = (x: number, y: number, color: number | undefined, opacity: number = 1.0) => {

  let c = cubesForHire.find(c => c.active === false)

  if (c){
    c.active = true
    ephemerals.add(c.cube)
  }

  if (c === undefined) {
    c = createCube()
    cubesForHire.push(c)
  }


  if (c.material.color.getHex() !== color) {
    c.material.color.setHex(color);
  }
  
  c.material.transparent = true

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
  
  memoryCrashAvoider(.7)

  let grid: TileState[][] = boardState.grid
  players = boardState.players

  ephemerals.remove(...ephemerals.children)
  cubesForHire.forEach(c => c.active = false)
  let skippedTiles = 0

  for (let x = 0; x < b.gridSize; x++) {
    for (let y = 0; y < b.gridSize; y++) {
      const index = x * b.gridSize + y;
      if (lastGrid.length > 1 && lastGrid[x][y].terrain === grid[x][y].terrain){
        skippedTiles++
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
  if (!document.hasFocus()) return // to prevent crashing in the background
  // renderer.render(scene, camera)
  let playerId = localStorage.getItem('playerId')
  if (playerId && players){
    let {x, y } = (players as Players)[playerId]
    let newTargetPos = { x: x - b.gridSize / 2, y: y - b.gridSize - 8 };

    if (!lerp.start) {
      lerp.start = Date.now();
      lerp.startPos = { x: camera.position.x, y: camera.position.y };
      lerp.targetPos = newTargetPos;
    } else {
      lerp.targetPos = newTargetPos; // Update target position continuously
      let now = Date.now();
      let elapsed = now - lerp.start;
      let t = Math.min(elapsed / lerp.duration, 1); // Interpolation factor
  
      let newX = lerp.startPos.x + t * (lerp.targetPos.x - lerp.startPos.x);
      let newY = lerp.startPos.y + t * (lerp.targetPos.y - lerp.startPos.y);
  
      camera.position.set(newX, newY, 10);
      if (t === 1) {
        lerp.start = null; // Reset lerpStart for the next movement
      }
    }
  }

  const composer = new EffectComposer( renderer );

  const renderPass = new RenderPass( scene, camera );
  composer.addPass( renderPass );
  
  const pixelPass = new RenderPixelatedPass(16, scene, camera);
  composer.addPass( pixelPass );
  
  const outputPass = new OutputPass();
  composer.addPass( outputPass );

  composer.render()

}

setInterval(() => {
  requestAnimationFrame(() => animate())
  // renderer.render(scene, camera)
}, 50)

document.addEventListener('keydown', (event) => {
  if (socket.connected === false) return
  const keyName = event.key;

  const directions: { [key: string]: string } = {
    w: "u",
    a: "l",
    s: "d",
    d: "r"
  };

  if (directions.hasOwnProperty(keyName)) {
    socket.emit("input event", { playerId: playerId(), direction: directions[keyName] });
  }
  
});

interface ElementCodePair {
  element: HTMLElement;
  code: string;
}

interface KeyBindings {
  [key: string]: ElementCodePair;
}

document.addEventListener('DOMContentLoaded', () => {
  const keyBindings: KeyBindings = {
    "w": { element: document.getElementById('up-button')!, code: 'u' },
    "a": { element: document.getElementById('left-button')!, code: 'l' },
    "s": { element: document.getElementById('down-button')!, code: 'd' },
    "d": { element: document.getElementById('right-button')!, code: 'r' },
  };
  
  // Touchscreens
  for (const key of Object.keys(keyBindings)) {
    const keyBinding = keyBindings[key];
    keyBinding.element.addEventListener('touchstart', () => {
      socket.emit('input event', { playerId: playerId(), direction: keyBinding.code });
    });
  }

  // Touchscreens
  for (const key of Object.keys(keyBindings)) {
    const keyBinding = keyBindings[key];
    keyBinding.element.addEventListener('click', () => {
      socket.emit('input event', { playerId: playerId(), direction: keyBinding.code });
    });
  }
})