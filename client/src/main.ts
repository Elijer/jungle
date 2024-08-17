import './style.css'
import { Group, PlaneGeometry, Mesh, MeshBasicMaterial, Color} from 'three';
import setupClient from './lib/setupClient.js'
import sceneSetup from './lib/setupScene.js'
import b from './lib/boardConfig.js'
import emphemeralsHandler from './lib/ephemeralsHandler.js'
import { BoardState, LocalBoardState, Entity, EntityStateEvent, KeyBindings } from './lib/interfaces.js'
import { hideClassIfTouchDevice, lerp, throttle, gid } from './lib/utilities.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let fpsInterval: number, startTime, now, then: number, elapsed
let cameraY = 5
let zCameraOffset = b.squareSize * 7
let cameraRotation = -.6
let cameraX: number, cameraZ: number;
// let lastGrid: any = {}

let config = {
  lerpMode: true,
  postProcessing: true,
  lerpSpeed: .1,
  inputThrottle: 90,
  relativeCameraPos: {x: 0, y: 4.5, z: 8}
}

// Might want to move these later
// They are used to create tiles
let terrainTiles: any = new Array(b.gridSize * b.gridSize)
let lastTiles: any = []
const geo = new PlaneGeometry(b.squareSize, b.squareSize)
const rotate90 = -(Math.PI / 2)


// let { scene, camera, renderer, terrainTiles, composer} = sceneSetup(cameraRotation, config)
let { scene, camera, renderer, composer} = sceneSetup(cameraRotation, config)
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


// HANDLE LOCAL STATE
// Deprecating this
// However, I may keep this as a debugging tool
// socket.on("state", (boardState: BoardState) => {

//   console.log("state received", boardState)

//   let index, terrain
//   // console.log(boardState)

//   for (let x = 0; x < b.gridSize; x++) {
//     for (let y = 0; y < b.gridSize; y++) {
//       index = x * b.gridSize + y;
//       terrain = boardState.grid[x][y].terrain
//       terrainTiles[index].mat.color.setHex(terrain?.color);
//     }
//   }

//   for (let playerId in boardState.players) {
//     let player: Entity = boardState.players[playerId]
//     if (playerId === localStorage.getItem("playerId")){
//       let {x, y} = player.position
//       cameraTargetX = x * b.squareSize - b.gridSize / 2
//       cameraTargetZ = y * b.squareSize + zCameraOffset
//     }
//     ephemerals.createEphemeral(player)
//   }

// })


socket.on('localState', (lbs: LocalBoardState) => {
  // console.log(lbs.grid)
  let tileIndex = new Array(2 * (lbs.radius * 2 + 1))
  let index, terrain
  console.log("-----------------------")
  console.log(lbs)

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

  // This needs to happen in case you walk over to a non-moving character
  // Simultaneously, a moving character can PUSH to your state (rather than you pulling theirs)
  // TO DO: we should only be sending local players, but
  // let newEphemerals: any = {}
  for (let playerId in lbs.players) {

    // console.log(epephs)

    // set camera
    let player: Entity = lbs.players[playerId]
    if (playerId === localStorage.getItem("playerId")){
      let {x, y} = player.position
      cameraTargetX = x * b.squareSize - b.gridSize / 2
      cameraTargetZ = y * b.squareSize + zCameraOffset
    }
    
    // check to see if ephemeral exists
    // remove ephemerals that are out of the active zone
    // remove TILES out of the active zone
    if (ephemerals.ephs[player.id]){
      // TO DO: These should be a single updating method
      // NOTE: I DO HAVE player information in the space layer I could do this from, but I am choosing to do it from the players information
      // I think that the players is a separate list because it's more likely to change
      // It might be simpler to just do everything from the grid though, and drop the players...
      ephemerals.moveCube(player.id, player.position.x, player.position.y)
      ephemerals.updateCubeTransparency(player.id, player.layer === "spirit" ? true : false)
      // newEphemerals[player.id] = ephemerals.ephs[player.id]
    } else {
      ephemerals.createEphemeral(player)
    }
  }

  // ephemerals.ephs = {...newEphemerals} // in theory this should remove all ephemerals that are no longer in use // No idea how performant this is


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
