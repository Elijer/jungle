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

  checkTileExistsAndIsEmpty(x, y){
    if (x < 0 || y < 0) return
    if (x >= this.gridSize || y >= this.gridSize) return
    let isit = this.grid[x] && this.grid[x][y] && !this.grid[x][y].space
    return isit
  }

  move(direction){

    let directions = {
      "u": { x: 0, y: -1 },
      "d": { x: 0, y: 1 },
      "l": { x: -1, y: 0 },
      "r": { x: 1, y: 0 }
    }

    let movement = directions[direction]
    let tileExistsAndIsEmpty = this.checkTileExistsAndIsEmpty(this.position.x + movement.x, this.position.y + movement.y)
    if (!tileExistsAndIsEmpty) return
    let { x, y } = this.position
    let nX = x + movement.x
    let nY = y + movement.y
    this.#changeLocation(nX, nY)
  }

  #changeLocation(newX, newY){
    let { x, y } = this.position
    this.cohort[this.id] = { x: newX, y: newY }
    this.grid[x][y].space = null
    this.grid[newX][newY].space = this
    this.grid[newX][newY].space.position = {x: newX, y: newY}
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