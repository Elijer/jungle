// Okay so I have the x and y, let's say a 7x7 grid with the player in the middle.
// Or rather, I generate it.

// Here's the local state function

getLocalState(centerX, centerY){
  let tempGrid = []
  // x = 2, y = 3

  // Okay so. I go from left to right on the columns.
  // On the first column, I should omit _ from the beginning and end of the y iterations
  // In the middle, omit none
  // And at the end, omit the same


  for (let x = centerX - this.refreshRadius; x <= centerX + this.refreshRadius; x++){
    const row = []
    for (let y = centerY - this.refreshRadius; y <= centerY + this.refreshRadius; y++){
      if (x < 0 || x >= this.rows || y < 0 || y >= this.cols){
        // To check:
        // I think x >= this.rows is right, rows = 50,
        //so the max index of x should be 49, so if x >= rows, it's gone at least one above the index available
        row.push(null) // Not sure if null is best representation of this
        continue
      }

      let span = this.refreshRadius * 2 + 1
      if (x === 0 || x === span){
        if (y === 0 || y === span){
          // okay not very clever but the idea here is that if we're at the f
          row.push(null)
          continue
        }
      }

      let tile = this.grid[x][y]
      row.push(tile.getState())
    }
    tempGrid.push(row)
    // push the row
  }

  return {
    grid: tempGrid, // push this local grid
    relativeTo: {x: centerX, y: centerY},
    radius: this.refreshRadius,
    players: this.players.getEntities(), // push all players...although
    // Should the local grid be enough?
    // To Return to
    // Once I've looked at the frontend code
  }
}

