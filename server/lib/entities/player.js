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

  tileNumber(){
    console.log(`y position: ${this.position.y}, x position: ${this.position.x}`)
    return this.position.y * this.gridSize + this.position.x
  }

  online(){
    const currentTileNumber = this.tileNumber()
    console.log("grid length", this.grid.length)
    console.log("current tile number", currentTileNumber)
    this.grid[currentTileNumber].space = this
    this.grid[currentTileNumber].spirit = null
    this.layer = "space" 
  }

  offline(){
    this.grid[this.tileNumber()].space = null
    this.grid[this.tileNumber()].spirit = this
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