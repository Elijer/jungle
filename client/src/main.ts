import './style.css'
import * as THREE from 'three';
import setupClient from './lib/setupClient.js'
import sceneSetup from './lib/setupScene.js'
import { BoardState, TileState, Players, KeyBindings, UpdateState } from './lib/interfaces.js'

const { socket, playerId } = setupClient()
let { scene, camera, renderer, b, terrainTiles } = sceneSetup()

// Setup dynamic objects
let ephemerals = new THREE.Group()
scene.add(ephemerals)

// HANDLE LOCAL STATE
socket.on("state", (boardState: any) => {
  let index
  let terrain
  for (let x = 0; x < b.gridSize; x++) {
    for (let y = 0; y < b.gridSize; y++) {
      index = x * b.gridSize + y;
      terrain = boardState.grid[x][y].terrain
      terrainTiles[index].mat.color.setHex("0x" + terrain.color);
    }
  }

  renderer.render(scene, camera);
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
