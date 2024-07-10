import { simplexPositive } from './simplex2.js';
import Tile from './entities/tile.js';
import Terrain from './entities/terrain.js';
import Player from './entities/player.js';
import EntityGroup from './entityGroup.js';

class GameInstance {
  constructor(rows, cols) {
    this.rows = rows
    this.cols = cols
    this.terrain = {}
    this.grid = this.initializeGrid()
    this.noiseScale = 10

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

  findRandomSpot(layer, counter = 0){
    const limit = 100
    let x = Math.floor(Math.random() * this.rows)
    let y = Math.floor(Math.random() * this.cols)
    if (this.grid[x][y][layer]){
      counter++
      if (counter < limit){
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
      player = this.grid[x][y].spirit ?? this.grid[x][y].space
    }

    if (!this.players.ents[playerId]){
      console.log("Player does not exist");
      ({ x, y } = this.findRandomSpot('space'))
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
    player.move(inputEvent.command)
    return player.getState("move")
  }
}

export default GameInstance