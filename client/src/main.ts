import './style.css'
import { Group, PlaneGeometry, Mesh, MeshBasicMaterial, Color} from 'three';
import setupClient from './lib/setupClient.js'
import sceneSetup from './lib/setupScene.js'
import b from './lib/boardConfig.js'
import emphemeralsHandler from './lib/ephemeralsHandler.js'
import { BoardState, LocalBoardState, Entity, EntityStateEvent, KeyBindings } from './lib/interfaces.js'
import { hideClassIfTouchDevice, lerp, throttle, gid } from './lib/utilities.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let startingTime = Date.now()
const midmap = b.gridSize / 2 * b.squareSize * b.gapSize

let timing = {
  interval: 16, // the millisecond interval of 20 times a second. 16 is ~60fps.
  now: startingTime,
  then: startingTime,
  elapsed: startingTime
}

let cam = {
  y: 5,
  x: midmap,
  z: midmap,
  zOffset: b.squareSize * 7,
  rotation: -.6,
}

let gameconfig = {
  lerpMode: true, // adds camera smoothing
  postProcessing: true, // adds pixelation effect
  lerpSpeed: .04, // 1 is infinitely fast - no lerp. .04 starts getting pretty delayed.
  inputColdownTime: 60, // cooldown in ms between inputs. Limits player power and network stress.
  cameraPositionrelativeToPlayer: {x: 0, y: 4.5, z: 8}
}

let terrainTiles: Mesh[] = new Array(b.gridSize * b.gridSize)
let lastTiles: Mesh[] = []
const geo = new PlaneGeometry(b.squareSize, b.squareSize)
const rotate90: number = -(Math.PI / 2)

let { scene, camera, renderer, composer} = sceneSetup(cam.rotation, gameconfig)
const { socket, playerId } = setupClient()
let controls: OrbitControls | null
let orbitMode = false

let cameraTargetX = cam.x
let cameraTargetZ = cam.z

hideClassIfTouchDevice('arrow-key-interface')
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
      cubePos.x + gameconfig.cameraPositionrelativeToPlayer.x,
      cubePos.y + gameconfig.cameraPositionrelativeToPlayer.y,
      cubePos.z + gameconfig.cameraPositionrelativeToPlayer.z
    )
    camera.rotation.set(cam.rotation, 0, 0 )
  }

}

// ANIMATION LOOP
let animate = () => {

  // For throttling
  timing.now = Date.now()
  timing.elapsed = timing.now - timing.then
  if (timing.elapsed > timing.interval){

    // Handle Camera Centering
    if (cameraTargetX && cameraTargetZ && !orbitMode){

      if (!gameconfig.lerpMode){
        cam.x = cameraTargetX
        cam.z = cameraTargetZ
      }

      if (gameconfig.lerpMode){
        cam.x = lerp(camera.position.x, cameraTargetX, gameconfig.lerpSpeed);
        cam.z = lerp(camera.position.z, cameraTargetZ, gameconfig.lerpSpeed);
      }

      camera.position.set(cam.x, cam.y, cam.z)
    }

    if (gameconfig.postProcessing && composer){
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
    timing.then = timing.now - (timing.elapsed % timing.interval);
  }
  
  requestAnimationFrame(animate)
}

function animationThrottler(animationFunction: Function) {
  timing.then = Date.now();
  animationFunction()
}

animationThrottler(animate)

socket.on('localState', (lbs: LocalBoardState): void => {
  let terrain
  console.log("-----------------------")
  for (let playerId in lbs.players) {

    let player: Entity = lbs.players[playerId]
    if (playerId === localStorage.getItem("playerId")){
      let {x, y} = player.position
      cameraTargetX = x * b.squareSize - b.gridSize / 2
      cameraTargetZ = y * b.squareSize + cam.zOffset
    }
    
    if (ephemerals.ephs[player.id]){
      // TO DO: These should be a single updating method
      // NOTE: I DO HAVE player information in the space layer I could do this from, but I am choosing to do it from the players information
      // I think that the players is a separate list because it's more likely to change
      // It might be simpler to just do everything from the grid though, and drop the players object - the camera should still be able to figure out the user's player body
      ephemerals.moveCube(player.id, player.position.x, player.position.y)
      ephemerals.updateCubeTransparency(player.id, player.layer === "spirit" ? true : false)
    } else {
      ephemerals.createEphemeral(player)
    }
  }

  // This is what clears tiles when you move so that you don't have em trailing behind you
  for (let lt of lastTiles){
    lt.visible = false
  }


  for (let x = 0; x < lbs.grid.length; x++){ // so we're going through all of the columns here
    let relativeX = lbs.relativeTo.x - lbs.radius + x // and we're setting relative x, but this isn't really giving us issues
    for (let y = 0; y < lbs.grid.length; y++){ // what's giving us issues is y. We go through each item of every column, until 
      let relativeY = lbs.relativeTo.y - lbs.radius + y
      let index = relativeX * b.gridSize + relativeY
      try {
        terrain = lbs.grid[x][y].terrain
        // const mat = new MeshBasicMaterial({color: 'red'})
        const mat = new MeshBasicMaterial({color: new Color(parseInt(terrain?.color ?? 'FFFFFF', 16))})
        const tile = new Mesh(geo, mat)
        tile.rotation.x = rotate90
        tile.position.set(
          (relativeX * b.squareSize * b.gapSize) - b.gridSize * b.squareSize * b.gapSize / 2,
          0,
          relativeY * b.squareSize * b.gapSize
        )

        terrainTiles[index] = tile
        lastTiles.push(tile) // save the last tiles so that we can sweep em up next time
        scene.add(tile)
      } catch (e) {
        // console.log("NAH", e)
      }
    }
  }

})

// TO DO: get rid of redundant update state interface
socket.on("update", (entity: EntityStateEvent) => {
  
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
      cam.x = entity.position.x - 10
      cam.z = entity.position.y
      let {x, y} = entity.position
      cameraTargetX = x * b.squareSize - b.gridSize / 2
      cameraTargetZ = y * b.squareSize + cam.zOffset
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
  }, gameconfig.inputColdownTime))

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
