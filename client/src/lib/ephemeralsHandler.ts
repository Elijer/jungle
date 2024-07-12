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

    let transparency = ephemeral.layer === "spirit" ? true : false
    const body = this.createCube(ephemeral.position.x, ephemeral.position.y, parseInt(ephemeral.color), transparency)

    this.ephs[ephemeral.id] = {
      ...body,
      color: ephemeral.color,
      position: ephemeral.position,
      layer: ephemeral.layer
    }
  }

  createBoxBufferGeometry = (squareSize: number) => {
    const h = squareSize / 2;

    const vertices = new Float32Array([
      // Front face
      -h, -h,  h,
       h, -h,  h,
       h,  h,  h,
      -h,  h,  h,
  
      // Back face
      -h, -h, -h,
      -h,  h, -h,
       h,  h, -h,
       h, -h, -h,
  
      // Top face
      -h,  h, -h,
      -h,  h,  h,
       h,  h,  h,
       h,  h, -h,
  
      // Right face
       h, -h, -h,
       h,  h, -h,
       h,  h,  h,
       h, -h,  h,
  
      // Left face
      -h, -h, -h,
      -h, -h,  h,
      -h,  h,  h,
      -h,  h, -h,
    ]);
  
    const indices = new Uint16Array([
        0, 1, 2,  0, 2, 3,    // front
        4, 5, 6,  4, 6, 7,    // back
        8, 9, 10, 8, 10, 11,  // top
        12, 13, 14, 12, 14, 15, // right
        16, 17, 18, 16, 18, 19  // left
    ]);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.setIndex(new THREE.BufferAttribute(indices, 1));
    geo.computeVertexNormals(); // This is needed if you want to have correct lighting on your box
    return geo
  }

  createCube = (x: number, y: number, color: number, transparent: boolean) => {
    


    const geo = this.createBoxBufferGeometry(b.squareSize);
    const mat = new THREE.MeshBasicMaterial({ color: color });
    const cube = new THREE.Mesh(geo, mat);
  
    mat.transparent = true;
    mat.opacity = 1;
    if (transparent){
      mat.opacity = 0.5;
    }
  
    // Calculate the position based on grid size and gap size
    const cubeX = (x * b.squareSize * b.gapSize) - b.gridSize * b.squareSize * b.gapSize / 2;
    const cubeY = b.squareSize / 2; // Position the cube above the plane
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