import Entity from "./entity.js"
import { generateRandomColor } from "../utilities.js"

export default class Player extends Entity {
  constructor(cohort, position, grid, id) {
    super(cohort, position, grid, id)
    this.color = generateRandomColor()
  }

  getState(){
    let payload = {
      ...super.getState(),
      color: this.getColor()
    }
    this.stateSchema.validateSync(payload)
    return payload
  }
}