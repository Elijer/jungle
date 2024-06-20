import { simplexPositive } from './simplex2.js';

class GameInstance {
  constructor(rows, cols) {
    this.rows = rows
    this.cols = cols
    this.players = {}
    this.grid = this.initializeGrid()
  }

  initializeGrid(){

    const grid = []
    for (let x = 0; x < this.rows; x++){
      const row = []
      for (let y = 0; y < this.cols; y++){
        let result = simplexPositive(x, y, .01)
        row.push(result)
        console.log(result)
      }
      grid.push(row)
    }
    return grid
  }
}

export default GameInstance