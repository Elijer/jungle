import { v4 as uuidv4 } from 'uuid';
import { stateSchema } from '../schemas.js'
import { gridSize } from '../gameConfig.js';
import { getTileNumberForCoords } from '../utilities.js';

export default class Entity {
  constructor(cohort, position, grid, id, layer="space"){
    this.id = id ?? uuidv4()
    this.cohort = cohort
    this.position = position
    this.grid = grid
    this.stateSchema = stateSchema
    this.layer = layer // TODO: I don't think we even need this
    // TODO but at the very least it's misleading that this defaults to space
    cohort[this.id] = position
    this.gridSize = gridSize
  }

  checkTileExistsAndIsEmpty(x, y){
    if (x < 0 || y < 0 || x >= this.gridSize || y >= this.gridSize) return
    const tileNumber = y * this.gridSize + x
    return this.grid[tileNumber] && !this.grid[tileNumber].space
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
    return getTileNumberForCoords(nX, nY, this.gridSize)
  }

  // TO DO: Check for redundancy between change Location and move and handleInput
  #changeLocation(newX, newY){
    let { x, y } = this.position
    this.cohort[this.id] = { x: newX, y: newY }
    const currentTile = y * this.gridSize + x
    const newTile = newY * this.gridSize + newX
    this.grid[currentTile].space = null
    this.grid[newTile].space = this
    // this.grid[newTile].space.position = {x: newX, y: newY}
    this.position = {x: newX, y: newY} // ^ I think this should be the same as above
  }

  getState(action = "none"){
    let payload = {
      id: this.id,
      position: this.position,
      layer: this.layer,
      action: action
    }
    this.stateSchema.validateSync(payload)
    return payload
  }
}