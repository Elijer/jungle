import * as THREE from 'three';

// Post processing
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { BoardConfig } from './interfaces.js';

const sceneSetup = () => {

  let gridSize = 10

  const b: BoardConfig = {
    gridSize: gridSize,
    squareSize: 1,
    gapSize: 0.0,
    verticalOffset: -(gridSize -1),
    terrainTiles: []
  }

  // Scene / Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 ); // there ARE other cameras
  camera.position.set(0, -8, 35);
  camera.rotation.set(.7, 0, 0);
  const renderer = new THREE.WebGLRenderer(); // There are also other...renders?
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  // Light
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 100, 100).normalize();
  scene.add(light);

  // Create a material for each square
  for (let i = 0; i < b.gridSize * b.gridSize; i++) {
    b.terrainTiles.push(new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
  }

  const group = new THREE.Group();

  for (let i = 0; i < b.gridSize; i++) {
    for (let j = 0; j < b.gridSize; j++) {
      const squareGeometry = new THREE.PlaneGeometry(b.squareSize, b.squareSize);
      const square = new THREE.Mesh(squareGeometry, b.terrainTiles[i * b.gridSize + j]);
      square.position.set(i * (b.squareSize + b.gapSize) - b.gridSize/2, 0, j * (b.squareSize + b.gapSize) + b.verticalOffset);
      square.rotation.x = -Math.PI / 2;
      group.add(square);
    }
  }

  group.rotation.x = -Math.PI / 2;
  scene.add(group);

  const composer = new EffectComposer( renderer );

  const renderPass = new RenderPass( scene, camera );
  composer.addPass( renderPass );

  const outputPass = new OutputPass();
  composer.addPass( outputPass );

  return {scene, camera, renderer, b, composer }
  
}

export default sceneSetup