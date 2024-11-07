import Entity from "./entity.js"
import { generateRandomColor } from "../utilities.js"

export default class Player extends Entity {
  constructor(cohort, position, grid, id, sign) {
    super(cohort, position, grid, id)
    this.color = generateRandomColor()
    this.geometry = "cube"
    this.sign = sign
    console.log(`Player created @ ${this.position} with id ${this.id} and sign ${this.sign}`)
  }

  online(){
    this.grid[this.position.x][this.position.y].space = this
    this.grid[this.position.x][this.position.y].spirit = null
    this.layer = "space"
  }

  offline(){
    this.grid[this.position.x][this.position.y].space = null
    this.grid[this.position.x][this.position.y].spirit = this
    this.layer = "spirit"
  }

  getState(action){
    let payload = {
      ...super.getState(action),
      color: this.getColor(),
      geometry: this.geometry,
      sign: this.sign
    }
    this.stateSchema.validateSync(payload)
    return payload
  }
}