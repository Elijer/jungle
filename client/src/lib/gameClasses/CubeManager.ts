import * as THREE from 'three';
import type { BoardConfig } from '../../interfaces.js';

export interface CubeForHire {
  active: boolean;
  geometry: any;
  material: any;
  cube: any;
}

export default class CubeManager {
  active: CubeForHire[]
  inactive: CubeForHire[]
  defaultGeometry: THREE.BoxGeometry
  b: BoardConfig
  
  constructor(b: any){
    this.active = []
    this.inactive = []
    this.defaultGeometry =  new THREE.BoxGeometry(b.squareSize, b.squareSize, b.squareSize);
    this.b = b
  }

  createCube(){
    const newCubeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    return {
      active: true,
      geometry: this.defaultGeometry,
      material: newCubeMaterial,
      cube: new THREE.Mesh(this.defaultGeometry, newCubeMaterial)
    }
  }


  addCube = (x: number, y: number, color: number | undefined, opacity: number = 1.0, group: THREE.Group) => {

    let c = this.inactive.pop()

    if (c){
      c.active = true
      group.add(c.cube)
      this.active.push(c)
    }

    if (!c) {
      c = this.createCube()
      this.active.push(c)
    }

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

    group.add(c.cube);
  
  }
}