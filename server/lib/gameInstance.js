import { simplexPositive } from './simplex2.js';
import rgbHex from 'rgb-hex';

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
        let color = this.getColor(result)
        row.push(color)
      }
      grid.push(row)
    }
    return grid
  }

  getColor(noise){
    return rgbHex(this.rgb[0] * noise, this.rgb[1] * noise, this.rgb[2] * noise)
  }
}

export default GameInstance