import './style.css'

import { io } from "socket.io-client";
import { v4 as uuidv4 } from 'uuid';

const herokuUrl = "https://thornberry-jungle-461255bc451e.herokuapp.com/"
const socketAddress = window.location.hostname === "localhost" ? "ws://localhost:3000" : herokuUrl
const socket = io(socketAddress)

const playerId = () => localStorage.getItem('playerId') || localStorage.setItem('playerId', uuidv4())

socket.on("connect", () => {
  console.log("Connected")
  socket.emit("player joined", playerId())
});

socket.on("player joined", (playerId: string) => {
  console.log("Player joined", playerId)
}) 

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 ); // there ARE other cameras

const renderer = new THREE.WebGLRenderer(); // There are also other...renders?
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );

const geometry = new THREE.BoxGeometry( 5, .2, 5 );
const material = new THREE.LineBasicMaterial( { color: 0xF8FFff } );
const cube = new THREE.Mesh( geometry, material );
cube.rotation.x += .8
cube.rotation.y += .1
// scene.add( cube );

const points: THREE.Vector3[] = [];

let back = 0
let interval = 2
for (let i = 0; i < 10; i++) {
  points.push( new THREE.Vector3( -10, 0, back ) );
  points.push( new THREE.Vector3( 10, 0, back ) );
  points.push( new THREE.Vector3( 10, 10, back ) );
  points.push( new THREE.Vector3( -10, 10, back ) )
  // points.push( new THREE.Vector3( -10, 0, back ) );
  back -= interval
}

const handlePoints = (points: THREE.Vector3[]) => {
  points.forEach(point => {
    point.y += 1
  })
}

// points.push( new THREE.Vector3( 5, 5, 5 ) );
const geometry2 = new THREE.BufferGeometry().setFromPoints( points );
const line = new THREE.Line( geometry2, material );
scene.add( line );

camera.position.z = 100;

camera.position.set( 0, 20, 100 );
controls.update();

function animate() {
  if (interval < 10){
    interval++
  }
  requestAnimationFrame( animate );
  controls.update();
  handlePoints(points)
	renderer.render( scene, camera );
}

renderer.setAnimationLoop( animate );