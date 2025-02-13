So I WAS sending all the players in the game on the localState event, but this makes very little sense at all.

Here was the code:

```ts
socket.on('localState', (lbs: LocalBoardState): void => {
  console.log(lbs)

  if (gameconfig.streamMode !== STREAM_MODE.LOCAL) return

  let terrain
  console.log("-----------------------")
  for (let playerId in lbs.players) {

    let player: Entity = lbs.players[playerId]
    if (playerId === localStorage.getItem("playerId")){
      let {x, y} = player.position
      cameraTargetX = x * b.squareSize - b.gridSize / 2
      cameraTargetZ = y * b.squareSize + camconfig.zOffset
    }
    
    if (ephemerals.ephs[player.id]){
      // TO DO: These should be a single updating method
      // NOTE: I DO HAVE player information in the space layer I could do this from, but I am choosing to do it from the players information
      // I think that the players is a separate list because it's more likely to change
      // It might be simpler to just do everything from the grid though, and drop the players object - the camera should still be able to figure out the user's player body
      ephemerals.moveCube(player.id, player.position.x, player.position.y)
      ephemerals.updateCubeTransparency(player.id, player.layer === "spirit" ? true : false)
    } else {
      ephemerals.createEphemeral(player)
    }
  }

  // This is what clears tiles when you move so that you don't have em trailing behind you
  for (let lt of lastTiles){
    lt.visible = false
  }

  const width = lbs.radius * 2 + 1
  for (let i = 0; i < lbs.grid.length; i++){
    const yOffset = Math.floor(i / width)
    const xOffset = i % width
    const y = lbs.relativeTo.y + yOffset - lbs.radius
    const x = lbs.relativeTo.x + xOffset - lbs.radius
    const tile = lbs.grid[i]
    if (!tile || y < 0 || y >= b.gridSize || x < 0 || x >= b.gridSize) continue
    try {
      terrain = tile.terrain
      // const mat = new MeshBasicMaterial({color: 'red'})
      const mat = new MeshBasicMaterial({
        color: new Color(parseInt(terrain?.color ?? 'FFFFFF', 16)),
        precision: "lowp",
        dithering: true
      })
      const terracotta = new Mesh(geo, mat)
      terracotta.rotation.x = rotate90
      terracotta.position.set(
        (x * b.squareSize * b.gapSize) - b.gridSize * b.squareSize * b.gapSize / 2,
        0,
        y * b.squareSize * b.gapSize
      )
      terrainTiles[i] = terracotta
      lastTiles.push(terracotta) // save the last tiles so that we can sweep em up next time
      scene.add(terracotta)
    } catch (e) {
      // console.log("NAH", e)
    }
  }

  // for (let i = 0; i < lbs.grid.length; i++){
  //   let yOffset = -lbs.radius
  //   let xOffset = -lbs.radius
  //   while (yOffset < lbs.radius){
  //     xOffset = -lbs.radius
  //     const y = lbs.relativeTo.y + yOffset
  //     while (xOffset < lbs.radius){
  //       const x = lbs.relativeTo.y + xOffset
  //       xOffset++
  //     }
  //     yOffset++
  //   }
  //   // 0, relativeY = 
  // }

  // for (let x = 0; x < lbs.grid.length; x++){ // so we're going through all of the columns here
  //   let relativeX = lbs.relativeTo.x - lbs.radius + x // and we're setting relative x, but this isn't really giving us issues
  //   for (let y = 0; y < lbs.grid.length; y++){ // what's giving us issues is y. We go through each item of every column, until 
  //     let relativeY = lbs.relativeTo.y - lbs.radius + y
  //     let index = relativeX * b.gridSize + relativeY
  //     try {
  //       terrain = lbs.grid[x][y].terrain
  //       // const mat = new MeshBasicMaterial({color: 'red'})
  //       const mat = new MeshBasicMaterial({
  //         color: new Color(parseInt(terrain?.color ?? 'FFFFFF', 16)),
  //         precision: "lowp",
  //         dithering: true
  //       })
  //       const tile = new Mesh(geo, mat)
  //       tile.rotation.x = rotate90
  //       tile.position.set(
  //         (relativeX * b.squareSize * b.gapSize) - b.gridSize * b.squareSize * b.gapSize / 2,
  //         0,
  //         relativeY * b.squareSize * b.gapSize
  //       )

  //       terrainTiles[index] = tile
  //       lastTiles.push(tile) // save the last tiles so that we can sweep em up next time
  //       scene.add(tile)
  //     } catch (e) {
  //       // console.log("NAH", e)
  //     }
  //   }
  // }

})
```

