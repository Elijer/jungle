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
    cohort[this.id] = position
  }

  createActionPayload(action){
    let payload = {
      id: this.id,
      color: this.color,
      action: action,
      position: this.position,
      geometry: this.geometry
    }
    this.stateSchema.validateSync(payload)
    return payload
  }

  getColor(){
    return "0x" + this.color
  }

  getState(){
    let payload = {
      id: this.id,
      position: this.position,
      geometry: this.geometry
    }
    this.stateSchema.validateSync(payload)
    return payload
  }
}