
// HANDLE LOCAL STATE
// Deprecating this
// However, I may keep this as a debugging tool
// What this does is receive an entire board's state from the backend
// Paired with the orbitControls, this can be a really helpful eye in the sky view

// socket.on("state", (boardState: BoardState) => {

//   console.log("state received", boardState)

//   let index, terrain
//   // console.log(boardState)

//   for (let x = 0; x < b.gridSize; x++) {
//     for (let y = 0; y < b.gridSize; y++) {
//       index = x * b.gridSize + y;
//       terrain = boardState.grid[x][y].terrain
//       terrainTiles[index].mat.color.setHex(terrain?.color);
//     }
//   }

//   for (let playerId in boardState.players) {
//     let player: Entity = boardState.players[playerId]
//     if (playerId === localStorage.getItem("playerId")){
//       let {x, y} = player.position
//       cameraTargetX = x * b.squareSize - b.gridSize / 2
//       cameraTargetZ = y * b.squareSize + cam.zOffset
//     }
//     ephemerals.createEphemeral(player)
//   }

// })