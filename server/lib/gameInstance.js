import { simplexPositive } from './simplex2.js';
import Tile from './entities/tile.js';
import Terrain from './entities/terrain.js';
import Player from './entities/player.js';
import EntityGroup from './entityGroup.js';
import { log } from './logger.js';

function getMonthBeginningTimestamp(){
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const elapsed = Math.floor(Math.floor(now.getTime()/1000)- startOfMonth.getTime() / 1000) / 10;
  return elapsed
}

class GameInstance {
  constructor(rows, cols, refreshRadius) {
    this.serverEpoch = getMonthBeginningTimestamp()
    this.playerCounter = 0
    this.objectCounter = 0
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

  generateItemId(){
    const id = this.objectCounter
    this.objectCounter++
    return id
  }

  createLightweightId(){
    // This id relies on a month having at most less than 3 million  seconds (2^22: ecodeable with 22 bits)
    // But dividing that up into groups of 10 seconds, for a max of 267,480, encodeable with 2^19 instead
    // And there not being more than 8K players, (2^13, encodeable with 13 bits)
    // total: 32 bits, or 8 bytes
    const counterBits = 13
    // Shift the timestamp left by 17 bits to make space for the counter
    const result = (this.serverEpoch << counterBits) | this.playerCounter
    this.playerCounter++

    // reset counter if it gets too large
    if (this.playerCounter >= (1 << counterBits)) {
      this.playerCounter = 0;
    }
    return result
  }

  // createUniqueLighweightId(){
  //   const result = BigInt(this.serverEpoch) << 32n | BigInt(this.playerCounter)
  //   this.playerCounter++
  //   return result
  // }

  initializeGrid(){
    let grid = [...Array(this.rows*this.cols)]
    grid = grid.map((_, index)=>{
      const x = index % this.cols
      const y = Math.floor(index / this.cols)
      let noise = simplexPositive(x, y, 20)
      let newTerrain = new Terrain(this.terrain, {x, y}, this, this.generateItemId(), noise)
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

    const tileNumbers = []

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
      tileNumbers.push(tileNumber)
      const tile = this.grid[tileNumber]
      const tileState = tile.getState()
      return tileState
    });

    return {
      tileNumbers,
      payload: {
        grid: tempGrid, // push this local grid
        relativeTo: {x: centerX, y: centerY},
        radius: this.refreshRadius,
      }
    }
  }

  // Saving this version of getting local state I had before
  // Even those its wrong, and should be deleted.
  getLocalStateWithPlayers(centerX, centerY){
    return {
      ...this.getLocalState(centerX, centerY),
      players: this.players.getEntities() // just sloppily gets all entities
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
      player = new Player(this.players.ents, {x, y}, this.grid, playerId)
    }

    // WARNING: I have observed a bug where player was undefined here
    // Yup, found it again
    if (!player){
      log(`Couldn't find player ${playerId}`)
      return
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

    const updates = []

    let player = this.grid[tileNumber].space
    if (!player) return false // this happens sometimes?
    const newTileNumber = player.move(inputEvent.command)

    // Unless the newTileNumber is undefined (caused by hitting an object and not succesfully moving)
    // push to list of updates to push to their individual socket rooms
    if (newTileNumber){
      updates.push({
        tileNumber: tileNumber,
        id: inputEvent.playerId,
        event: "removed", // added, removed (this is why I need to switch to typescript)
        item: this.grid[tileNumber]?.getState()
      })
  
      updates.push({
        tileNumber: newTileNumber,
        id: inputEvent.playerId,
        event: "added",
        item: this.grid[newTileNumber]?.getState()
      })
    }

    return {
      updates,
      ...player.getState("move")
    }
  }
}

export default GameInstance