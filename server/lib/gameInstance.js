import { simplexPositive } from './simplex2.js';
import rgbHex from 'rgb-hex';
import Tile from './entities/tile.js';

class GameInstance {
  constructor(rows, cols) {
    this.rows = rows
    this.cols = cols
    this.players = {}
    this.rgb = [50, 40, 40]
    this.grid = this.initializeGrid()
    this.noiseScale = 10
  }

  initializeGrid(){

    const grid = []
    for (let x = 0; x < this.rows; x++){
      const row = []
      for (let y = 0; y < this.cols; y++){
        let result = simplexPositive(x, y, 20)
        row.push(new Tile(result))
      }
      grid.push(row)
    }
    return grid
  }

  getGrid(){
    let tempGrid = []
    for (let x = 0; x < this.rows; x++){
      const row = []
      for (let y = 0; y < this.cols; y++){
        let tile = this.grid[x][y]
        row.push(tile.getColor())
      }
      tempGrid.push(row)
    }
    return tempGrid
  }
}

export default GameInstance