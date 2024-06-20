import { simplexPositive } from './simplex2.js';
import rgbHex from 'rgb-hex';

class GameInstance {
  constructor(rows, cols) {
    this.rows = rows
    this.cols = cols
    this.players = {}
    this.rgb = [40, 20, 52]
    this.grid = this.initializeGrid()
  }

  initializeGrid(){

    const grid = []
    for (let x = 0; x < this.rows; x++){
      const row = []
      for (let y = 0; y < this.cols; y++){
        let result = simplexPositive(x, y, .01)
        let color = this.getColor(result)
        row.push(color)
      }
      grid.push(row)
    }
    return grid
  }

  getColor(noise){
    return '#' + rgbHex(this.rgb[0], this.rgb[1], this.rgb[2], noise)
  }
}

export default GameInstance