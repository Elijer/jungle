interface LayerState {
  color: string
  geometry: string
}

export interface TileState {
  terrain: string;
  spaceLayer: LayerState | null;
  spiritLayer: LayerState | null;
}