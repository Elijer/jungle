import './style.css'
import * as THREE from 'three';
import setupClient from './lib/setupClient.js'
import sceneSetup from './lib/setupScene.js'
import b from './lib/boardConfig.js'
import emphemeralsHandler from './lib/ephemeralsHandler.js'
import { BoardState, Entity, EntityStateEvent, KeyBindings } from './lib/interfaces.js'
import { hideClassIfTouchDevice } from './lib/utilities.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let fpsInterval: number, startTime, now, then: number, elapsed
let cameraY = 5
let zCameraOffset = 8
let cameraRotation = -.6
let cameraX: number, cameraZ: number;

const { socket, playerId } = setupClient()
let { scene, camera, renderer, terrainTiles } = sceneSetup(cameraRotation)
let controls: OrbitControls | null
let orbitMode = false
let activeAnimationCallback = Function || null

let cameraTargetX: number | undefined, cameraTargetZ: number | undefined;

hideClassIfTouchDevice('arrow-key-interface')
// Setup dynamic objects
let ephemeralsGroup = new THREE.Group()
scene.add(ephemeralsGroup)

let ephemerals = new emphemeralsHandler(ephemeralsGroup)

socket.on("redundant connection", () => {
  alert("You are already connected in another tab, or device on this IP address.")
})

function enableOrbitControls() {
  if (controls) controls.dispose();
  controls = new OrbitControls(camera, renderer.domElement);
  controls.update();
}

function disableOrbitControls() {
  if (controls) {
    controls.dispose();
    controls = null;
  }
}

function toggleOrbitControls() {
  orbitMode = !orbitMode;
  if (orbitMode) {
    enableOrbitControls();
  } else {
    disableOrbitControls();

    let playerId = localStorage.getItem("playerId");
    if (playerId) {
      let entity = ephemerals.ephs[playerId];
      let cubePos = entity.cube.position
      let camPos = camera.position
      camera.position.set(cubePos.x, cubePos.y + 4.5, cubePos.z + 8)
      camera.rotation.set(cameraRotation, 0, 0 )
    }

  }
}

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

  // For throttling
  now = Date.now()
  elapsed = now - then
  if (elapsed > fpsInterval){

    if (cameraTargetX && cameraTargetZ && !orbitMode){
      cameraX = cameraTargetX
      cameraZ = cameraTargetZ

      let playerId = localStorage.getItem("playerId");
      if (playerId) {
        let entity = ephemerals.ephs[playerId];
        console.log("cube", entity.cube.position)
        console.log("camera", camera.position)
        // Cube position to camera translation is x=x, y=y+4.5,z=z+8
      }

      // Lerping
      // cameraX = lerp(camera.position.x, cameraTargetX, 0.1);
      // cameraZ = lerp(camera.position.z, cameraTargetZ, 0.1);

      camera.position.set(cameraX, cameraY, cameraZ)
    }

    renderer.render(scene, camera);
    then = now - (elapsed % fpsInterval);
  }
  
  requestAnimationFrame(animate)
}

function animationThrottler(fps: number, animationFunction: Function) {
  // throttlering vars
  fpsInterval = 1000 / fps;
  then = Date.now();
  startTime = then;
  animationFunction()
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

  document.addEventListener("keydown", (event): any => {
    if (event.code === "Digit0"){
      console.log("Toggling orbit mode")
      toggleOrbitControls()
      // orbitMode = !orbitMode
    }
  })

  const keyBindings: KeyBindings = {
    "w": { element: document.getElementById('up-button')!, code: 'u' },
    "a": { element: document.getElementById('left-button')!, code: 'l' },
    "s": { element: document.getElementById('down-button')!, code: 'd' },
    "d": { element: document.getElementById('right-button')!, code: 'r' },
  };

  for (const key in keyBindings) {
    if (keyBindings.hasOwnProperty(key)) {
      const keyBinding = keyBindings[key];
        keyBinding.element.addEventListener('touchend', () => {
          socket.emit('input event', { playerId: playerId, command: keyBinding.code });
        });
        console.log(`Added touchend listener for key ${key} on element ${keyBinding.element.id}`);
    }
  }
})
