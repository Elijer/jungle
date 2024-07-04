export default class EntityGroup {

  constructor(grid, type){
    this.type = type ?? "<unknown type>"
    this.ents = {}
    this.grid = grid;
    this.layers = ["space", "spirit"]
  }

  getEntities(){
    let entityMap = {}
    for (const key in this.ents){
      let { x, y } = this.ents[key]
      for (const layer of this.layers){
        if (this.grid[x][y][layer]){
          let entity = this.grid[x][y][layer]
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