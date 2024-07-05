import { v4 as uuidv4 } from 'uuid';
import { stateSchema } from '../schemas.js'

export default class Entity {
  constructor(cohort, position, grid, id){
    this.id = id ?? uuidv4()
    this.cohort = cohort
    this.position = position
    this.grid = grid
    this.stateSchema = stateSchema
    this.geometry = "default"
    this.layer = "space"
    cohort[this.id] = position
  }

  getColor(){
    return "0x" + this.color
  }

  getState(action = "none"){
    let payload = {
      id: this.id,
      position: this.position,
      geometry: this.geometry,
      layer: this.layer,
      action: action
    }
    this.stateSchema.validateSync(payload)
    return payload
  }
}