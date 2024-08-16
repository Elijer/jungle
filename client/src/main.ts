import './style.css'
import { Group, } from 'three';
import setupClient from './lib/setupClient.js'
import sceneSetup from './lib/setupScene.js'
import b from './lib/boardConfig.js'
import emphemeralsHandler from './lib/ephemeralsHandler.js'
import { BoardState, Entity, EntityStateEvent, KeyBindings } from './lib/interfaces.js'
import { hideClassIfTouchDevice, lerp, throttle, gid } from './lib/utilities.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let fpsInterval: number, startTime, now, then: number, elapsed
let cameraY = 5
let zCameraOffset = b.squareSize * 7
let cameraRotation = -.6
let cameraX: number, cameraZ: number;

let config = {
  lerpMode: true,
  postProcessing: true,
  lerpSpeed: .1,
  inputThrottle: 90,
  relativeCameraPos: {x: 0, y: 4.5, z: 8}
}

let { scene, camera, renderer, terrainTiles, composer} = sceneSetup(cameraRotation, config)
const { socket, playerId } = setupClient()
let controls: OrbitControls | null
let orbitMode = false

let cameraTargetX: number | undefined, cameraTargetZ: number | undefined;

hideClassIfTouchDevice('arrow-key-interface')
// Setup dynamic objects
let ephemeralsGroup = new Group()
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
    return
  }
  
  disableOrbitControls();

  // Recenter Camera on Player
  let playerId = localStorage.getItem("playerId");
  if (playerId) {
    let entity = ephemerals.ephs[playerId];
    let cubePos = entity.cube.position
    camera.position.set(
      cubePos.x + config.relativeCameraPos.x,
      cubePos.y + config.relativeCameraPos.y,
      cubePos.z + config.relativeCameraPos.z
    )
    camera.rotation.set(cameraRotation, 0, 0 )
  }

}

// HANDLE LOCAL STATE
socket.on("state", (boardState: BoardState) => {

  console.log("state received", boardState)

  let index, terrain
  // console.log(boardState)

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
      cameraTargetX = x * b.squareSize - b.gridSize / 2
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

    // Handle Camera Centering
    if (cameraTargetX && cameraTargetZ && !orbitMode){

      if (!config.lerpMode){
        cameraX = cameraTargetX
        cameraZ = cameraTargetZ
      }

      if (config.lerpMode){
        cameraX = lerp(camera.position.x, cameraTargetX, config.lerpSpeed);
        cameraZ = lerp(camera.position.z, cameraTargetZ, config.lerpSpeed);
      }

      camera.position.set(cameraX, cameraY, cameraZ)
    }

    if (config.postProcessing && composer){
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
    then = now - (elapsed % fpsInterval);
  }
  
  requestAnimationFrame(animate)
}

function animationThrottler(fps: number, animationFunction: Function) {
  fpsInterval = 1000 / fps;
  then = Date.now();
  startTime = then;
  animationFunction()
}

animationThrottler(20, animate)
// TO DO: get rid of redundant update state interface
socket.on("update", (entity: EntityStateEvent) => {
  console.log("Update received", entity)
  
  if (!entity) return

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
      // For a map of 100 * 100, ~50
      // For 20 * 20, ~10
      cameraTargetX = x * b.squareSize - b.gridSize / 2
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

  document.addEventListener('keydown', throttle((event: KeyboardEvent) => {
    if (event.code === "Digit0"){
      toggleOrbitControls()
      return
    }

    const keyName = event.key.toLowerCase();
    if (keyCommandBindings.hasOwnProperty(keyName)) {
      socket.emit("input event", {playerId: playerId, command: keyCommandBindings[keyName]})
      return
    }
  }, config.inputThrottle))

  const keyBindings: KeyBindings = {
    "w": { element: gid('up-button')!, code: 'u' },
    "a": { element: gid('left-button')!, code: 'l' },
    "s": { element: gid('down-button')!, code: 'd' },
    "d": { element: gid('right-button')!, code: 'r' },
  };

  for (const key in keyBindings) {
    if (keyBindings.hasOwnProperty(key)) {
      const keyBinding = keyBindings[key];
        keyBinding.element.addEventListener('touchend', () => {
          socket.emit('input event', { playerId: playerId, command: keyBinding.code });
        });
    }
  }
})
