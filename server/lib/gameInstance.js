import { simplexPositive } from './simplex2.js';
import Tile from './entities/tile.js';
import Terrain from './entities/terrain.js';
import Player from './entities/player.js';
import EntityGroup from './entityGroup.js';
import { log, warn, error } from './logger.js';

class GameInstance {
  constructor(rows, cols, refreshRadius) {
    this.rows = rows
    this.cols = cols
    this.terrain = {}
    this.grid = this.initializeGrid()
    this.noiseScale = 10
    this.refreshRadius = refreshRadius
    // this.refreshRadius = 40
    this.signDispenser = 0
    // TODO - curried functions should be able to embed cols and handle some of the grid manipulation logic
    this.players = new EntityGroup(this.grid, "players", this.cols) // must be called after grid
    
    this.maxSignVal = 2
  }

  // So this was for a sort of rock paper scissors experiment thing I don't really need
  dispenseSign(){
    const currentSign = this.signDispenser++
    if (this.signDispenser > this.maxSignVal) this.signDispenser = 0
    return currentSign
  }

  initializeGrid(){
    let grid = [...Array(this.rows*this.cols)]
    grid = grid.map((_, index)=>{
      const x = index % this.cols
      const y = Math.floor(index / this.cols)
      let noise = simplexPositive(x, y, 20)
      let newTerrain = new Terrain(this.terrain, {x, y}, this, noise)
      // in a map, this refers to the mapped element
      // not the gameInstance instance
      let newTile = new Tile(newTerrain)
      return newTile
    })

    return grid
  }

  getState(){
    return {
      grid: this.grid.map(tile=>tile.getState()),
      players: this.players.getEntities()
    }
  }

  getLocalState(centerX, centerY){

    const refreshDiameter = this.refreshRadius*2+1
    let tempGrid = Array.from({length: Math.pow(refreshDiameter, 2)}, (_, index) => {
      const simpleRow = Math.floor(index / refreshDiameter)
      const simpleCol = index % refreshDiameter
      const relativeRow = simpleRow - this.refreshRadius;
      const relativeCol = simpleCol - this.refreshRadius;
      
      const gridY = centerY + relativeRow;
      const gridX = centerX + relativeCol;
      
      if (gridY < 0 || gridY >= this.rows || gridX < 0 || gridX >= this.cols) {
        return null;
      }
      
      const tileNumber = gridY * this.cols + gridX
      const tile = this.grid[tileNumber]
      const tileState = tile.getState()
      // const tileState = this.grid[tileNumber].getState();
      return tileState
    });

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

  findRandomSpot(layer, counter = 0){
    // return {x: 0, y: 0} // for testing, always return the top left tile
    console.log("=========LOOKING FOR A RANDOM SPOT")
    const limit = 7
    const tileNumber = Math.floor(Math.random() * (this.rows * this.cols))
    console.log({tileNumber})
    const randomTile = this.grid[tileNumber]
    const y = Math.floor(tileNumber / this.cols)
    const x = tileNumber % this.cols
    if (randomTile[layer]){ // sort of a gotcha - if there IS something here at this layer, then try again
      log(`No space for player at ${x}:${y}:${layer}, trying again`)
      counter++
      if (counter < limit){
        log(`Tried ${counter}x, no space found`)
        throw new Error('Could not find a spot for the player')
      }
      return this.findRandomSpot(layer, counter)
    }
    return {x, y}
  }

  playerOnlineOrAddPlayer(playerId){

    let x, y, player;

    if (this.players.ents[playerId]){
      console.log("Player already exists");
      ({ x, y } = this.players.ents[playerId])
      const tileNumber = y*this.cols+x
      log(`${playerId.substring(0,4)} already exists at ${x}:${y}`)
      player = this.grid[tileNumber].spirit ?? this.grid[tileNumber].space
    }

    if (!this.players.ents[playerId]){
      console.log("Player was not found: creating player in state");
      try {
        ({ x, y } = this.findRandomSpot('space'))
      } catch (e){
        console.log(e)
        return
      }
      console.log("Location generated for newplayer:", x, y)
      player = new Player(this.players.ents, {x, y}, this.grid, playerId, this.dispenseSign())
    }

    // WARNING: I have observed a bug where player was undefined here
    player.online()
    // this.grid[x][y].space = player
    // this.grid[x][y].spirit = null

    return player.getState("online")
    // return player.createActionPayload("space")
  }

  playerOffline(playerId){
    if (!this.players.ents[playerId]){
      console.log(`Failed to remove player ${playerId}: they do not exist in the game`)
      return
    }

    let { x, y } = this.players.ents[playerId]
    const tileNumber = y * this.cols + x
    let player = this.grid[tileNumber].space
    if (!player){
      console.log(`Failed to remove player ${playerId}: they are not in the game`)
      return
    }
    player.offline()
    return player.getState("offline")
  }

  handleInput(inputEvent){
    if (!this.players.ents[inputEvent.playerId]) return
    let {x, y} = this.players.ents[inputEvent.playerId]
    const tileNumber = y * this.cols + x
    let player = this.grid[tileNumber].space
    if (!player) return false // this happens sometimes?
    player.move(inputEvent.command)
    return player.getState("move")
  }
}

export default GameInstance