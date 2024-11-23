export default class EntityGroup {

  constructor(grid, type, cols){
    this.type = type ?? "<unknown type>"
    this.ents = {}
    this.grid = grid;
    this.layers = ["space", "spirit"]
    this.cols = cols
  }

  getEntities(){
    let entityMap = {}
    for (const key in this.ents){
      let { x, y } = this.ents[key]
      const tileNumber = y*this.cols+x
      for (const layer of this.layers){
        if (this.grid[tileNumber][layer]){
          let entity = this.grid[tileNumber][layer]
          entityMap[key] = {
            ...entity.getState(),
            layer: layer
          }
        }
      }
    }
    return entityMap
  }
}