import { v4 as uuidv4 } from 'uuid';

export default class Entity {
  constructor(cohort, position, grid, id){
    this.id = id ?? uuidv4()
    this.cohort = cohort
    this.position = position
    this.grid = grid
    cohort[this.id] = position
  }

  removeEntity(){
    delete this.cohort[this.id]
    let {x, y} = this.position
    for (let plane of ["spirit", "physical"]){
      this.grid[x][y][plane] = null
    }
  }

  getColor(){
    return "0x" + this.color
  }

  getState(){
    return{
      id: this.id,
      position: this.position
    }
  }
}