export default class EntityGroup {

  constructor(entities, grid){
    this.entities = entities;
    this.grid = grid;
    this.layers = ["space", "spirit"]
  }

  getEntities(){
    let entityMap = {}
    for (const key in this.entities){
      let { x, y } = this.entities[key]
      for (const layer of this.layers){
        if (this.grid[x][y][layer]){
          let entity = this.grid[x][y][layer]
          console.log("entity", entity)
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