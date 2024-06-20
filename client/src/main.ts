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

// Set up camera with a view from above
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 ); // there ARE other cameras
camera.position.set(0, 150, 0);
camera.lookAt(0, 0, 0);

// Set up renderer and add it to the DOM
const renderer = new THREE.WebGLRenderer(); // There are also other...renders?
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Add orbit controls for moving around
const controls = new OrbitControls( camera, renderer.domElement );

// Add a directional light to the scene
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 100, 100).normalize();
scene.add(light);

// Create the grid of squares
const gridSize = 20;
const squareSize = 1;
const gapSize = 0.1;
const materials = [];


// Create a material for each square
for (let i = 0; i < gridSize * gridSize; i++) {
  materials.push(new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
}

const group = new THREE.Group();

for (let i = 0; i < gridSize; i++) {
  for (let j = 0; j < gridSize; j++) {
    
    // Create the square geometry
    const squareGeometry = new THREE.PlaneGeometry(squareSize, squareSize);

    // Create the square mesh
    const square = new THREE.Mesh(squareGeometry, materials[i * gridSize + j]);
    
    // Position the square with a gap
    square.position.set(i * (squareSize + gapSize), 0, j * (squareSize + gapSize));
    
    // Rotate the square to lie flat on the xz-plane
    square.rotation.x = -Math.PI / 2;
    
    // Add the square to the group
    group.add(square);
  }
}

group.rotation.x = -Math.PI / 2;
scene.add(group);

for (let x = 0; x < gridSize; x++) {
  for (let y = 0; y < gridSize; y++) {
    const index = x * gridSize + y;
    materials[index].color.setHex(Math.random() * 0xffffff);
  }
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// Start the animation
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});