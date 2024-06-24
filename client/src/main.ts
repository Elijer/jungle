import * as THREE from 'three';

import './style.css'
import { TileState } from './interfaces.js'

import setupClient from './lib/setupClient.js'
import sceneSetup from './lib/sceneSetup.js'

const socket = setupClient()
let { scene, camera, renderer, b } = sceneSetup()

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

const addCube = (x: number, y: number, color: number | undefined, opacity: number = 1.0) => {
  const greenCubeMaterial = new THREE.MeshBasicMaterial({ color: color });
  const greenCubeGeometry = new THREE.BoxGeometry(b.squareSize, b.squareSize, b.squareSize);
  const greenCube = new THREE.Mesh(greenCubeGeometry, greenCubeMaterial);
  if (opacity < 1.0) greenCubeMaterial.transparent = true
  greenCubeMaterial.opacity = opacity

  greenCube.position.set(
    x * (b.squareSize + b.gapSize) - b.gridSize / 2,
    y * (b.squareSize + b.gapSize) - b.gridSize + 1,
    .5
  );
  scene.add(greenCube);
}

socket.on("grid", (grid: TileState[][]) => {
  for (let x = 0; x < b.gridSize; x++) {
    for (let y = 0; y < b.gridSize; y++) {
      const index = x * b.gridSize + y;
      let color = "0x" + grid[x][y].terrain

      b.terrainTiles[index].color.setHex(color);
      if (grid[x][y].spaceLayer?.geometry === "cube"){
        addCube(x, y, parseInt("0x" + grid[x][y].spaceLayer?.color))
      }

      if (grid[x][y].spiritLayer?.geometry === "cube"){
        console.log("Yes")
        addCube(x, y, parseInt("0x" + grid[x][y].spiritLayer?.color), .05)
      }

    }
  }

  animate();
})