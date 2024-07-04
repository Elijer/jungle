class EntityGroup {
  entities: any;
  grid: any;
  layers: string[]

  constructor(entities: any, grid: any){
    this.entities = entities;
    this.grid = grid;
    this.layers = ["physical", "spirit"]
  }

  getEntities(){
    let entityMap: any = {}
    for (const key in this.entities){
      let { x, y } = this.entities[key]
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