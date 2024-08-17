// const terrainTiles: any = []
// let index
// const geo = new PlaneGeometry(b.squareSize, b.squareSize)

// Here's all the tile stuff I got rid of above
// But here's the thing - do i even want to render tiles? They are so expensive.
// What are they good for is figuring out like, what's been loaded. But there may be a better way to do that.
// Like for example, I could just do lines, or some other less computationally expensive way to show two things basically
// - What are the limits of the rendered world around you
// - Also like, are you moving? Just having a texure that acts as a reference point to your movement
  // const terrainTiles: any = []

  // Getting rid of all this tile prepopulation business. We'll just create them when we get the info.
  // let index
  // const geo = new PlaneGeometry(b.squareSize, b.squareSize);
  // for (let x = 0; x < b.gridSize; x++) {
  //   for (let y = 0; y < b.gridSize; y++) {
  //     index = x * b.gridSize + y;
  //     const mat = new MeshBasicMaterial({ color: 0x000000, side: DoubleSide })
  //     const tile = new Mesh(geo, mat);
  //     tile.rotation.x = rotate90
  //     tile.position.set((x * b.squareSize * b.gapSize) - b.gridSize * b.squareSize * b.gapSize / 2, 0, y * b.squareSize * b.gapSize)
  //     terrainTiles.push({
  //       tile,
  //       x,
  //       y,
  //       mat,
  //       geo
  //     })
  //     scene.add(tile)
  //   }
  // }