import Entity from "./entity.js"
import { generateRandomColor } from "../utilities.js"

export default class Player extends Entity {
  constructor(cohort, position, grid, id) {
    super(cohort, position, grid, id)
    this.color = generateRandomColor()
  }

  getState(){
    return {
      ...super.getState(),
      color: this.getColor()
    }
  }
}