import './style.css'
import * as THREE from 'three';
import setupClient from './lib/setupClient.js'
import sceneSetup from './lib/setupScene.js'
import b from './lib/boardConfig.js'
import EntityHandler from './lib/entityHandler.js'
import { update } from 'three/examples/jsm/libs/tween.module.js';

const { socket, playerId } = setupClient()
let { scene, camera, renderer, terrainTiles } = sceneSetup()
let fpsInterval: number, startTime, now, then: number, elapsed;

// Setup dynamic objects
let ephemerals = new THREE.Group()
scene.add(ephemerals)

let entities = new EntityHandler(ephemerals)

// HANDLE LOCAL STATE
socket.on("state", (boardState: any) => {
  let index, terrain

  for (let x = 0; x < b.gridSize; x++) {
    for (let y = 0; y < b.gridSize; y++) {
      index = x * b.gridSize + y;
      terrain = boardState.grid[x][y].terrain
      terrainTiles[index].mat.color.setHex(terrain.color);
    }
  }

  for (let playerId in boardState.players) {
    let player = boardState.players[playerId]
    entities.createEntity(player)
  }
})

// ANIMATION LOOP
let animate = () => {

  requestAnimationFrame(animate)

  now = Date.now()
  elapsed = now - then
  if (elapsed > fpsInterval){
    renderer.render(scene, camera);
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

socket.on("update", (updateState: any) => {
  console.log(updateState)
  if (updateState.action === "online"){

  }

  // if (updateState.action === "offline") {
  //   console.log("YPPP")
  //   entities.ents[updateState.playerId].mat.opacity = .5
  //   // entities.updateCubeTransparency(updateState.playerId, false)
  //   // let player = entities.ents[updateState.playerId]
  //   // ephemerals.remove(player.cube)
  //   // delete entities.ents[updateState.playerId]
  // }

  // if (updateState.action === "online"){
    
  // }
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
