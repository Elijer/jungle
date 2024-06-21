interface SpaceLayerState {
  color: string
  geometry: string
}

export interface TileState {
  terrain: string;
  spaceLayer: SpaceLayerState | null;
}