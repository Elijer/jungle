import { BufferGeometry, MeshBasicMaterial, Mesh } from 'three';

export interface LayerState {
  color: string
  id: string
  position: Position
  layer: "spirit" | "space" | "terrain"
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
  position: Position;
}

export interface EntityStateEvent extends Entity {
  action: string;
}

export type Entities = {
  [key: string]: Entity;
};

``
export interface BoardState {
  grid: TileState[][];
  players: Entities
}

// Technically the same so far as BoardState,
// Even though smaller amounts of boardstate will be transmitted
// And possibly not as many players sent over?
// Not yet sure what to do about the players
export interface LocalBoardState {
  grid: TileState[]
  relativeTo: Position
  radius: number,
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