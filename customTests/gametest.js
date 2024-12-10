import GameInstance from '../server/lib/gameInstance.js'
import Terrain from '../server/lib/entities/terrain.js'

const gc = {
  gridSize: 10,
  refreshRadius: 3
}

const game = new GameInstance(gc.gridSize, gc.gridSize, gc.refreshRadius)
console.assert(game.grid.length === gc.gridSize * gc.gridSize, "Unexpected game instance grid length")
for (let tile of game.grid){
  const {space, spirit, terrain} = tile
  console.assert(space == null, "Expect all tile.space layers to be null on creation")
  console.assert(spirit === null, "Expect all tile.spirit layers to be null on creation")
  console.assert(terrain instanceof Terrain, "Expect all tile.terrain layers to be filled on creation")
  console.assert(terrain.noise >= 0 && tile.terrain.noise <= 1)

  const {noise, layer, gridSize, geometry, position} = terrain
  const tileState = tile.getState()
  console.assert(tileState.terrain.position.x < gc.gridSize && tileState.terrain.position.x >= 0, "tile terrain X position within normal range")
  console.assert(tileState.terrain.position.y < gc.gridSize && tileState.terrain.position.y >= 0, "tile terrain y position within normal range")
}

const playerA = game.playerOnlineOrAddPlayer('a')
const playerB = game.playerOnlineOrAddPlayer('b')
const playerC = game.playerOnlineOrAddPlayer('c') 