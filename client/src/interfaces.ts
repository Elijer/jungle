interface LayerState {
  color: string
  geometry: string
  id: string
}

export interface Player {
    x: number;
    y: number;
    online: boolean;
}

export type Players = {
  [key: string]: Player;
};


export interface BoardState {
  grid: TileState[][];
  players: Players
}

export interface TileState {
  terrain: string;
  spaceLayer: LayerState | null;
  spiritLayer: LayerState | null;
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

export interface UpdateState {
  action: string
  playerId: string
  x: number
  y: number
  color: string | undefined
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