import * as THREE from 'three';
import { CubeForHire } from './interfaces.js'

import './style.css'
import { TileState } from './interfaces.js'

import setupClient from './lib/setupClient.js'
import sceneSetup from './lib/sceneSetup.js'

const { socket, playerId } = setupClient()
let { scene, camera, renderer, b } = sceneSetup()

// Animation loop
function animate() {
  renderer.render(scene, camera);
}

let cubesForHire: CubeForHire[] = []

let ephemerals = new THREE.Group();
scene.add(ephemerals)

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
  console.log(cubesForHire)

  if (c){
    console.log("Recucling")
    c.active = true
    ephemerals.add(c.cube)
  }

  if (c === undefined) {
    c = createCube()
    cubesForHire.push(c)
  }

  c.material.color.setHex(color)
  c.material.transparent = true
  c.material.opacity = opacity
  console.log(opacity)

  c.cube.position.set(
    x * (b.squareSize + b.gapSize) - b.gridSize / 2,
    y * (b.squareSize + b.gapSize) - b.gridSize + 1,
    .5
  );

  ephemerals.add(c.cube);
}

socket.on("grid", (grid: TileState[][]) => {

  ephemerals.remove(...ephemerals.children)
  cubesForHire.forEach(c => c.active = false)

  for (let x = 0; x < b.gridSize; x++) {
    for (let y = 0; y < b.gridSize; y++) {
      const index = x * b.gridSize + y;
      let color = "0x" + grid[x][y].terrain

      b.terrainTiles[index].color.setHex(color);
      if (grid[x][y].spaceLayer?.geometry === "cube"){
        addCube(x, y, parseInt("0x" + grid[x][y].spaceLayer?.color), 1.0)
      }

      if (grid[x][y].spiritLayer?.geometry === "cube"){
        addCube(x, y, parseInt("0x" + grid[x][y].spiritLayer?.color), .05)
      }

    }
  }
  animate();
})

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

  for (const key of Object.keys(keyBindings)) {
    const keyBinding = keyBindings[key];
    keyBinding.element.addEventListener('tap', () => {
      socket.emit('input event', { playerId: playerId(), direction: keyBinding.code });
    });
  }
});