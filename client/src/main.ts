import './style.css'
import * as THREE from 'three';
import setupClient from './lib/setupClient.js'
import sceneSetup from './lib/setupScene.js'
import b from './lib/boardConfig.js'
import emphemeralsHandler from './lib/ephemeralsHandler.js'
import { BoardState, UpdateState, Entity } from './lib/interfaces.js'

const { socket, playerId } = setupClient()
let { scene, camera, renderer, terrainTiles } = sceneSetup()
let fpsInterval: number, startTime, now, then: number, elapsed;

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
    ephemerals.createEphemeral(player)
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

socket.on("update", (updateState: UpdateState) => {


  // CURRENT: make sure that all clientside events are typed
  // NEXT: handle player action updates
  // NEXT2: handle player movement updates

  if (updateState.action === "online"){
    let eph = ephemerals.ephs[updateState.id]
    if (!eph){
      console.log(updateState)
      // color: string
      // geometry: string
      // id: string
      // // layer
      // // position
      // ephemerals.createEphemeral()
    }

    console.log(updateState)
  }

  // if (updateState.action === "offline") {
  //   console.log("YPPP")
  //   ephemerals.ents[updateState.playerId].mat.opacity = .5
  //   // ephemerals.updateCubeTransparency(updateState.playerId, false)
  //   // let player = ephemerals.ents[updateState.playerId]
  //   // ephemeralsGroup.remove(player.cube)
  //   // delete ephemerals.ents[updateState.playerId]
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
