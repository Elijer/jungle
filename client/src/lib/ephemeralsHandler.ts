import b from './boardConfig.js'
import * as THREE from 'three';
import { Entity, Ephs } from './interfaces.js'

class ephemeralsHandler {
  ephs: Ephs
  target: THREE.Group

  constructor(target: THREE.Group){
    this.ephs = {}
    this.target = target
  }

  createEphemeral = (ephemeral: Entity) => {

    // so there is an issue with the color here so that the update event, when adding a new cube, doesn't add it with the right color
    let transparency = ephemeral.layer === "spirit" ? true : false
    const body = this.createCube(ephemeral.position.x, ephemeral.position.y, parseInt(ephemeral.color), transparency)

    this.ephs[ephemeral.id] = {
      ...body,
      color: ephemeral.color,
      position: ephemeral.position,
      layer: ephemeral.layer
    }
  }

  createCube = (x: number, y: number, color: number, transparent: boolean) => {
    const geo = new THREE.BoxGeometry(b.squareSize, b.squareSize, b.squareSize);
    const mat = new THREE.MeshBasicMaterial({ color: color });
    const cube = new THREE.Mesh(geo, mat);
  
    mat.transparent = true;
    mat.opacity = 1;
    if (transparent){
      mat.opacity = 0.5;
    }
  
    // Calculate the position based on grid size and gap size
    const cubeX = (x * b.squareSize * b.gapSize) - b.gridSize * b.squareSize * b.gapSize / 2;
    const cubeY = b.squareSize / x; // Position the cube above the plane
    const cubeZ = y * b.squareSize * b.gapSize;
  
    cube.position.set(cubeX, cubeY, cubeZ);
    this.target.add(cube);
    return {
      cube, geo, mat
    }
  }

  moveCube = (id: string, x: number, y: number) => {
    this.ephs[id].cube.position.x = (x * b.squareSize * b.gapSize) - b.gridSize * b.squareSize * b.gapSize / 2;
    this.ephs[id].cube.position.z = y * b.squareSize * b.gapSize;
  }

  updateCubeTransparency(id: string, transparent: boolean){
    this.ephs[id].mat.opacity = transparent ? 0.4 : 1
  }
}

export default ephemeralsHandler