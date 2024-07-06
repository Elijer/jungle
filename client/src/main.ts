import './style.css'
import * as THREE from 'three';
import setupClient from './lib/setupClient.js'
import sceneSetup from './lib/setupScene.js'
import b from './lib/boardConfig.js'
import emphemeralsHandler from './lib/ephemeralsHandler.js'
import { BoardState, Entity, EntityStateEvent } from './lib/interfaces.js'
import { lerp } from './lib/utils.js'

let fpsInterval: number, startTime, now, then: number, elapsed
let cameraY = 5
let zCameraOffset = 8
let cameraRotation = -.6
let cameraX: number, cameraZ: number;

const { socket, playerId } = setupClient()
let { scene, camera, renderer, terrainTiles } = sceneSetup(cameraRotation)

let cameraTargetX: number | undefined, cameraTargetZ: number | undefined;


// Setup dynamic objects
let ephemeralsGroup = new THREE.Group()
scene.add(ephemeralsGroup)

let ephemerals = new emphemeralsHandler(ephemeralsGroup)

// HANDLE LOCAL STATE
socket.on("state", (boardState: BoardState) => {

  let index, terrain
  console.log(boardState)

  for (let x = 0; x < b.gridSize; x++) {
    for (let y = 0; y < b.gridSize; y++) {
      index = x * b.gridSize + y;
      terrain = boardState.grid[x][y].terrain
      terrainTiles[index].mat.color.setHex(terrain?.color);
    }
  }

  for (let playerId in boardState.players) {
    let player: Entity = boardState.players[playerId]
    if (playerId === localStorage.getItem("playerId")){
      let {x, y} = player.position
      cameraTargetX = x * b.squareSize - 10
      cameraTargetZ = y * b.squareSize + zCameraOffset
    }
    ephemerals.createEphemeral(player)
  }
})

// ANIMATION LOOP
let animate = () => {

  requestAnimationFrame(animate)

  // For throttling
  now = Date.now()
  elapsed = now - then
  if (elapsed > fpsInterval){

    if (cameraTargetX && cameraTargetZ){
      cameraX = cameraTargetX
      cameraZ = cameraTargetZ

      // Lerping
      // cameraX = lerp(camera.position.x, cameraTargetX, 0.1);
      // cameraZ = lerp(camera.position.z, cameraTargetZ, 0.1);

      camera.position.set(cameraX, cameraY, cameraZ)
    }

    renderer.render(scene, camera);
    then = now - (elapsed % fpsInterval);
  }

}

function animationThrottler(fps: number, animationFunction: Function) {
  // throttlering vars
  fpsInterval = 1000 / fps;
  then = Date.now();
  startTime = then;
  animationFunction();
}

animationThrottler(20, animate)
// TO DO: get rid of redundant update state interface
socket.on("update", (entity: EntityStateEvent) => {

  if (entity.action === "online"){

    if (!ephemerals.ephs[entity.id]){
      ephemerals.createEphemeral(entity)
    }

    if (ephemerals.ephs[entity.id]){
      ephemerals.updateCubeTransparency(entity.id, false)
    }
  }

  if (entity.action === "offline"){

    if (ephemerals.ephs[entity.id]){
      ephemerals.updateCubeTransparency(entity.id, true)
    }
  }

  if (entity.action === "move"){
    if (entity.id === localStorage.getItem("playerId")){
      cameraX = entity.position.x - 10
      cameraZ = entity.position.y
      let {x, y} = entity.position
      cameraTargetX = x * b.squareSize - 10
      cameraTargetZ = y * b.squareSize + zCameraOffset
    }
    ephemerals.moveCube(entity.id, entity.position.x, entity.position.y)
  }

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
