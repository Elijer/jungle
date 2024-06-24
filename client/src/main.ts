import * as THREE from 'three';
import { CubeForHire } from './interfaces.js'

import './style.css'
import { TileState } from './interfaces.js'

import setupClient from './lib/setupClient.js'
import sceneSetup from './lib/sceneSetup.js'

const { socket, playerId } = setupClient()
let { scene, camera, renderer, b } = sceneSetup()

let cubesForHire: CubeForHire[] | null = []
for (let i = 0; i < 10; i++) {
  const newCubeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const newCubeGeometry = new THREE.BoxGeometry(b.squareSize, b.squareSize, b.squareSize);
  const newCube = new THREE.Mesh(newCubeGeometry, newCubeMaterial);
  cubesForHire.push({
    active: false,
    geometry: newCubeGeometry,
    material: newCubeMaterial,
    cube: newCube
  })
}

// Animation loop
function animate() {

  requestAnimationFrame(animate);

  renderer.render(scene, camera);

}

let ephemerals = new THREE.Group();
scene.add(ephemerals)

const addCube = (x: number, y: number, color: number | undefined, opacity: number = 1.0) => {
  let c = cubesForHire.find(c => c.active === false)
  if (c === undefined) return
  c.active = true
  c.material.visible = true
  c.material.color.setHex(color)
  if (opacity < 1.0) c.material.transparent = true
  c.material.opacity = opacity

  c.cube.position.set(
    x * (b.squareSize + b.gapSize) - b.gridSize / 2,
    y * (b.squareSize + b.gapSize) - b.gridSize + 1,
    .5
  );
  ephemerals.add(c.cube);
}

socket.on("grid", (grid: TileState[][]) => {

  for (let c in cubesForHire){
    cubesForHire[c].active = false
    cubesForHire[c].material.visible = false
  }

  for (let x = 0; x < b.gridSize; x++) {
    for (let y = 0; y < b.gridSize; y++) {
      const index = x * b.gridSize + y;
      let color = "0x" + grid[x][y].terrain

      b.terrainTiles[index].color.setHex(color);
      if (grid[x][y].spaceLayer?.geometry === "cube"){
        addCube(x, y, parseInt("0x" + grid[x][y].spaceLayer?.color))
      }

      if (grid[x][y].spiritLayer?.geometry === "cube"){
        addCube(x, y, parseInt("0x" + grid[x][y].spiritLayer?.color), .05)
      }

    }
  }

  animate();
})

document.addEventListener('keydown', (event) => {
  if (socket.connected === false) return
  const keyName = event.key;

  const directions: { [key: string]: string } = {
    w: "u",
    a: "l",
    s: "d",
    d: "r"
  };

  if (directions.hasOwnProperty(keyName)) {
    socket.emit("input event", { playerId: playerId(), direction: directions[keyName] });
  }
  
});