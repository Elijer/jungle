interface LayerState {
  color: string
  geometry: string
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