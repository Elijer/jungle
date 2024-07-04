import './style.css'
import * as THREE from 'three';
import setupClient from './lib/setupClient.js'
import sceneSetup from './lib/setupScene.js'
import b from './lib/boardConfig.js'

const { socket, playerId } = setupClient()
let { scene, camera, renderer, terrainTiles } = sceneSetup()

// Setup dynamic objects
let ephemerals = new THREE.Group()
scene.add(ephemerals)

let entities: any = {}

const createCube = (x: number, y: number, color: number, transparent: boolean) => {
  const geo = new THREE.BoxGeometry(b.squareSize, b.squareSize, b.squareSize);
  const mat = new THREE.MeshBasicMaterial({ color: color });
  const cube = new THREE.Mesh(geo, mat);

  mat.transparent = true;
  if (transparent){
    mat.opacity = 0.5;
  }


  // Calculate the position based on grid size and gap size
  const cubeX = (x * b.squareSize * b.gapSize) - b.gridSize * b.squareSize * b.gapSize / 2;
  const cubeY = b.squareSize / x; // Position the cube above the plane
  const cubeZ = y * b.squareSize * b.gapSize;

  cube.position.set(cubeX, cubeY, cubeZ);
  ephemerals.add(cube);
  return {
    cube, geo, mat
  }
}

// HANDLE LOCAL STATE
socket.on("state", (boardState: any) => {
  let index, terrain
  console.log(boardState)

  for (let x = 0; x < b.gridSize; x++) {
    for (let y = 0; y < b.gridSize; y++) {
      index = x * b.gridSize + y;
      terrain = boardState.grid[x][y].terrain
      terrainTiles[index].mat.color.setHex(terrain.color);
    }
  }

  for (let playerId in boardState.players) {
    let player = boardState.players[playerId]
    const body = createCube(player.position.x, player.position.y, parseInt(player.color), false)
    entities[playerId] = {
      ...body,
      color: player.color,
      position: player.position,
      layer: player.layer
    }
  }

  renderer.render(scene, camera);
})

socket.on("update", (updateState: any) => {
  console.log(updateState)
})

const keyCommandBindings: { [key: string]: string } = {
  w: 'u',
  s: 'd',
  a: 'l',
  d: 'r'
}

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener("keyup", (event): any => {
    const keyName = event.key.toLowerCase();
    if (keyCommandBindings.hasOwnProperty(keyName)) {
      socket.emit("input event", {playerId: playerId, command: keyCommandBindings[keyName]})
    }
  });
})
