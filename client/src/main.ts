import './style.css'
import * as THREE from 'three';
import setupClient from './lib/setupClient.js'
import sceneSetup from './lib/setupScene.js'
import { BoardState, TileState, Players, KeyBindings, UpdateState } from './lib/interfaces.js'

const { socket, playerId } = setupClient()
let { scene, camera, renderer, b, composer } = sceneSetup()

// Setup render objects
let ephemerals = new THREE.Group()
scene.add(ephemerals)

// HANDLE LOCAL STATE
socket.on("state", (boardState: any) => {
  console.log("Received state", boardState)
})
