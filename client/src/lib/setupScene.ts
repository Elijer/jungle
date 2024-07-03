import * as THREE from 'three';

// Post processing
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { BoardConfig } from './interfaces.js';

const sceneSetup = () => {

  const b: any = {
    gridSize: 20,
    squareSize: 1,
    gapSize: 1,
    // gapSize: 1.1,
  }

  const terrainTiles: any = []

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 );
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild( renderer.domElement );

  // 45 degree view
  camera.position.z = b.gridSize * 1; // Move the camera away from the box so we can see it
  camera.position.y = b.gridSize * 1.6; // Move the camera away from the box so we can see it
  camera.rotation.x = b.gridSize / -16; // Tilt the camera down a bit

  // Add light
  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  const rotate90 = Math.PI / 2

  let index
  for (let x = 0; x < b.gridSize; x++) {
    for (let y = 0; y < b.gridSize; y++) {
      index = x * b.gridSize + y;
      const mat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide })
      const geo = new THREE.PlaneGeometry(b.squareSize, b.squareSize);
      const tile = new THREE.Mesh(geo, mat);
      tile.rotation.x = rotate90
      tile.position.set((x * b.squareSize * b.gapSize) - b.gridSize * b.squareSize * b.gapSize / 2, 0, y * b.squareSize * b.gapSize)
      terrainTiles.push({
        tile,
        x,
        y,
        mat,
        geo
      })
      scene.add(tile)
    }
  }

  renderer.render(scene, camera);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

    return {scene, camera, renderer, terrainTiles, b}
}

export default sceneSetup