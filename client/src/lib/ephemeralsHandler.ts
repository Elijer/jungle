import b from './boardConfig.js'
import { Group, BufferAttribute, BufferGeometry, Mesh, MeshBasicMaterial } from 'three';
import { Entity, Ephs } from './interfaces.js'

interface BodyReference {
  cube: Mesh,
  geo: BufferGeometry,
  mat: MeshBasicMaterial
}

let transparentMat = 0.03

class ephemeralsHandler {
  ephs: Ephs
  target: Group
  cube: BufferGeometry

  constructor(target: Group){
    this.ephs = {}
    this.target = target
    this.cube = this.createBoxBufferGeometry(b.squareSize)
  }

  removeEphemeral = (id: string) => {
    const eph = this.ephs[id]
    const { cube, geo, mat } = eph;
    if (cube) {
      this.target.remove(cube); // Remove from scene
      geo.dispose(); // Dispose of geometry
      mat.dispose(); // Dispose of material
    }
    delete this.ephs[id]
  }

  createEphemeral = (ephemeral: Entity): void => {

    let transparency = ephemeral.layer === "spirit" ? true : false
    const body = this.createCube(ephemeral.position.x, ephemeral.position.y, parseInt(ephemeral.color), transparency)

    this.ephs[ephemeral.id] = {
      ...body,
      color: ephemeral.color,
      position: ephemeral.position,
      layer: ephemeral.layer
    }
  }

  createBoxBufferGeometry = (squareSize: number): BufferGeometry => {
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
        0, 1, 2,  0, 2, 3,      // front
        4, 5, 6,  4, 6, 7,      // back
        8, 9, 10, 8, 10, 11,    // top
        12, 13, 14, 12, 14, 15, // right
        16, 17, 18, 16, 18, 19  // left
    ]);

    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(vertices, 3));
    geo.setIndex(new BufferAttribute(indices, 1));
    geo.computeVertexNormals(); // This is needed if you want to have correct lighting on your box
    return geo
  }

  createCube = (x: number, y: number, color: number, transparent: boolean): BodyReference => {
    
    const geo = this.cube
    const mat = new MeshBasicMaterial({ color: color });
    const cube = new Mesh(geo, mat);
  
    mat.transparent = true;
    mat.opacity = 1;
    if (transparent){
      mat.opacity = transparentMat;
    }
  
    // Calculate the position based on grid size and gap size
    const cubeX = (x * b.squareSize * b.gapSize) - b.gridSize * b.squareSize * b.gapSize / 2;
    const cubeY = b.squareSize / 2; // Position the cube above the plane
    const cubeZ = y * b.squareSize * b.gapSize;
  
    cube.position.set(cubeX, cubeY, cubeZ);
    this.target.add(cube);

    return { cube, geo, mat }

  }

  moveCube = (id: string, x: number, y: number): void => {
    this.ephs[id].cube.position.x = (x * b.squareSize * b.gapSize) - b.gridSize * b.squareSize * b.gapSize / 2;
    this.ephs[id].cube.position.z = y * b.squareSize * b.gapSize;
  }

  updateCubeTransparency = (id: string, transparent: boolean):void => {
    this.ephs[id].mat.opacity = transparent ? transparentMat : 1
  }
}

export default ephemeralsHandler