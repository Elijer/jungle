interface LayerState {
  color: string
  geometry: string
}

export interface Player {
    x: number;
    y: number;
    online: boolean;
}

export interface BoardState {
  grid: TileState[][];
  players: {
    [key: string]: Player;
  };
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

export interface CubeForHire {
  active: boolean;
  geometry: any;
  material: any;
  cube: any;
}