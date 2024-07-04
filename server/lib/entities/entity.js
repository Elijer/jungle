import { v4 as uuidv4 } from 'uuid';
import { stateSchema } from '../schemas.js'

export default class Entity {
  constructor(cohort, position, grid, id){
    this.id = id ?? uuidv4()
    this.cohort = cohort
    this.position = position
    this.grid = grid
    this.stateSchema = stateSchema
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
    let payload = {
      id: this.id,
      position: this.position
    }
    this.stateSchema.validateSync(payload)
    return payload
  }
}