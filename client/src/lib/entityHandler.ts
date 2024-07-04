import b from './boardConfig.js'
import * as THREE from 'three';

class EntityHandler {
  ents: {[key: string]: any}
  target: THREE.Group

  constructor(target: THREE.Group){
    this.ents = {}
    this.target = target
  }

  createEntity = (entity: any) => {
    const body = this.createCube(entity.position.x, entity.position.y, parseInt(entity.color), false)

    this.ents[entity.id] = {
      ...body,
      color: entity.color,
      position: entity.position,
      layer: entity.layer
    }
  }

  createCube = (x: number, y: number, color: number, transparent: boolean) => {
    const geo = new THREE.BoxGeometry(b.squareSize, b.squareSize, b.squareSize);
    const mat = new THREE.MeshBasicMaterial({ color: color });
    const cube = new THREE.Mesh(geo, mat);
  
    mat.transparent = true;
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

  updateCubeTransparency(id: string, transparent: boolean){
    this.ents[id].mat.transparent = transparent
    this.ents[id].mat.opacity = transparent ? 0.5 : 1
  }
}

export default EntityHandler