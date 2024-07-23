import { BufferGeometry, MeshBasicMaterial, Mesh } from 'three';

export interface LayerState {
  color: string
  geometry: string
  id: string
  // layer
  // position
}

export interface Eph {
  // geo: BoxGeometry
  geo: BufferGeometry
  mat: MeshBasicMaterial
  cube: Mesh
  color: string
  position: { x: number; y: number }
  layer: string
}

export interface Ephs {
  [key: string]: Eph
}

export interface Entity extends LayerState {
  layer: string;
  position: Position;
}

export interface EntityStateEvent extends Entity {
  action: string;
}

export type Entities = {
  [key: string]: Entity;
};


export interface BoardState {
  grid: TileState[][];
  players: Entities
}

export interface TileState {
  terrain: LayerState | null;
  space: LayerState | null;
  spirit: LayerState | null;
}

export interface BoardConfig {
  gridSize: number;
  squareSize: number;
  gapSize: number;
  verticalOffset: number;
  terrainTiles: any[];
}

export interface LerpConfig {
  start: number | null;
  duration: number;
  startPos: { x: number; y: number };
  targetPos: { x: number; y: number };
}

interface ElementCodePair {
  element: HTMLElement;
  code: string;
}

export interface KeyBindings {
  [key: string]: ElementCodePair;
}

// This is actually the same interface as the Entity interface - can merge them later!! They are sort of different concepts...?
// export interface UpdateState {
//   id: string
//   color: string
//   layer: string
//   geometry: string
//   position: Position
// }

export interface Position {
  x: number;
  y: number;
}

export interface Cube {
  geometry: any;
  material: any;
  cube: any;
  objectId: string;
}