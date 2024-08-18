import { simplexPositive } from './simplex2.js';
import Tile from './entities/tile.js';
import Terrain from './entities/terrain.js';
import Player from './entities/player.js';
import EntityGroup from './entityGroup.js';
import { log, warn, error } from './logger.js';

class GameInstance {
  constructor(rows, cols) {
    this.rows = rows
    this.cols = cols
    this.terrain = {}
    this.grid = this.initializeGrid()
    this.noiseScale = 10
    this.refreshRadius = 4

    this.players = new EntityGroup(this.grid, "players") // must be called after grid
  }

  initializeGrid(){
    const grid = []
    for (let x = 0; x < this.rows; x++){
      const row = []
      for (let y = 0; y < this.cols; y++){
        let noise = simplexPositive(x, y, 20)
        let newTerrain = new Terrain(this.terrain, {x, y}, this.grid, noise)
        let newTile = new Tile(newTerrain)
        row.push(newTile)
      }
      grid.push(row)
    }
    return grid
  }

  getState(){
    let tempGrid = []
    for (let x = 0; x < this.rows; x++){
      const row = []
      for (let y = 0; y < this.cols; y++){
        let tile = this.grid[x][y]
        row.push(tile.getState())
      }
      tempGrid.push(row)
    }


    return {
      grid: tempGrid,
      players: this.players.getEntities()
    }
  }

  getLocalState(centerX, centerY){
    let tempGrid = []
    // x = 2, y = 3
    for (let x = centerX - this.refreshRadius; x <= centerX + this.refreshRadius; x++){
      const row = []
      for (let y = centerY - this.refreshRadius; y <= centerY + this.refreshRadius; y++){
        if (x < 0 || x >= this.rows || y < 0 || y >= this.cols){ // check that tiles are in bounds
          row.push(null) // Not sure if null is best representation of this
          continue
        }

        let distanceFromCenter = Math.abs(centerX-x) + Math.abs(centerY-y)
        if (distanceFromCenter-this.refreshRadius > 1){
          row.push(null)
          continue
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

  findRandomSpot(layer, counter = 0){
    const limit = 20
    let x = Math.floor(Math.random() * this.rows)
    let y = Math.floor(Math.random() * this.cols)
    if (this.grid[x][y][layer]){
      log.warn(`No space for player at ${x}:${y}:${layer}, trying again`)
      counter++
      if (counter < limit){
        log.error(`Tried ${counter}x, no space found`)
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
      log(`${playerId.substring(0,4)} already exists at ${x}:${y}`)
      player = this.grid[x][y].spirit ?? this.grid[x][y].space
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
      player = new Player(this.players.ents, {x, y}, this.grid, playerId)
    }

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
    let player = this.grid[x][y].space
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
    let player = this.grid[x][y].space
    if (!player) return // this happens sometimes?
    player.move(inputEvent.command)
    return player.getState("move")
  }
}

export default GameInstance