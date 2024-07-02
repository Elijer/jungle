import * as THREE from 'three';
import type { BoardConfig, Position, Cube } from '../../interfaces.js';

export default class CubeManager {
  cubes: Cube[]
  defaultGeometry: THREE.BoxGeometry
  b: BoardConfig
  group: THREE.Group
  
  constructor(b: any, group: THREE.Group){
    this.cubes = []
    this.defaultGeometry =  new THREE.BoxGeometry(b.squareSize, b.squareSize, b.squareSize);
    this.b = b
    this.group = group
  }

  createCube(id: string){
    const newCubeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    return {
      geometry: this.defaultGeometry,
      material: newCubeMaterial,
      cube: new THREE.Mesh(this.defaultGeometry, newCubeMaterial),
      objectId: id
    }
  }

  moveCube = (playerId: string, newPosition: Position) => {
    let c = this.cubes.find(c => c.objectId === playerId)

    if (c){
      c.cube.position.set(
        newPosition.x * (this.b.squareSize + this.b.gapSize) - this.b.gridSize / 2,
        newPosition.y * (this.b.squareSize + this.b.gapSize) - this.b.gridSize + 1,
        .5
      );
    }
  }

  addCube = (x: number, y: number, color: number, opacity: number = 1.0, id: string) => {

    const c = this.createCube(id)
    this.group.add(c.cube)
    this.cubes.push(c)

    c.material.transparent = true

    if (c.material.color.getHex() !== color) {
      c.material.color.setHex(color);
    }

    // Only set opacity as needed
    if (c.material.opacity !== opacity) {
      c.material.transparent = opacity < 1.0; // Only set transparency if opacity is less than 1.0
      c.material.opacity = opacity;
    }

    c.cube.position.set(
      x * (this.b.squareSize + this.b.gapSize) - this.b.gridSize / 2,
      y * (this.b.squareSize + this.b.gapSize) - this.b.gridSize + 1,
      .5
    );

    this.group.add(c.cube);
  
  }
}