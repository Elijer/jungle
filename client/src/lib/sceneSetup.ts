import * as THREE from 'three';

// Post processing
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BoardConfig } from '../interfaces.js';

const sceneSetup = (funMode: boolean, speed: number) => {

  let gridSize = 50

  const b: BoardConfig = {
    gridSize: gridSize,
    squareSize: 1,
    gapSize: 0.0,
    verticalOffset: -(gridSize -1),
    terrainTiles: []
  }

  // Set up camera with a view from above
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 ); // there ARE other cameras
  // camera.position.set(0, -20, 10);
  camera.position.set(0, -8, 35); // aerial view
  camera.rotation.set(.7, 0, 0); // Adjust the angle as needed

  // camera.position.set(0, -150, 50); 
  // camera.rotation.set(0.99,0,0);

  
  // Set up renderer and add it to the DOM
  // const renderer = new THREE.WebGLRenderer({powerPreference: "high-performance"}); // There are also other...renders?
  const renderer = new THREE.WebGLRenderer(); // There are also other...renders?

  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  // Add a directional light to the scene
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

  for (let x = 0; x < b.gridSize; x++) {
    for (let y = 0; y < b.gridSize; y++) {
      const index = x * b.gridSize + y;
      b.terrainTiles[index].color.setHex(0xffffff);
    }
  }

  const composer = new EffectComposer( renderer );
  
  const renderPass = new RenderPass( scene, camera );
  composer.addPass( renderPass );
  
  // const pixelPass = new RenderPixelatedPass(8*speed, scene, camera);
  const pixelPass = new RenderPixelatedPass(1, scene, camera);
  composer.addPass( pixelPass );
  
  const outputPass = new OutputPass();
  composer.addPass( outputPass );

  // pixelPass.setPixelSize
  return {scene, camera, renderer, b, composer, pixelPass }
  
}

export default sceneSetup