import { simplexPositive } from './simplex2.js';
import Tile from './entities/tile.js';
import Player from './entities/player.js';

class GameInstance {
  constructor(rows, cols) {
    this.rows = rows
    this.cols = cols
    this.players = {}
    this.rgb = [50, 40, 40]
    this.grid = this.initializeGrid()
    this.noiseScale = 10
  }

  // Create a grid and fill the tiles with simplex noise tiles
  initializeGrid(){

    const grid = []
    for (let x = 0; x < this.rows; x++){
      const row = []
      for (let y = 0; y < this.cols; y++){
        let result = simplexPositive(x, y, 20)
        row.push(new Tile(result))
      }
      grid.push(row)
    }
    return grid
  }

  // Create the state of the game
  getState(){
    let tempGrid = []
    for (let x = 0; x < this.rows; x++){
      const row = []
      for (let y = 0; y < this.cols; y++){
        let tile = this.grid[x][y]
        row.push(tile.getPortableState())
      }
      tempGrid.push(row)
    }

    return {
      grid: tempGrid,
      players: this.players
    }
  }

  findRandomSpot(){
    let counter = 0
    const limit = 100
    let x = Math.floor(Math.random() * this.rows)
    let y = Math.floor(Math.random() * this.cols)
    if (this.grid[x][y].spaceLayer){
      counter++
      if (counter < limit){
        throw new Error('Could not find a spot for the player')
      }
      return this.findRandomSpot()
    }
    return {x, y}
  }

  addPlayer(playerId){

    let x, y;
    let color;

    if (this.players[playerId]){ // If player already exists, just set them to online and flip their layer to physical
      this.players[playerId].online = true;
      ({ x, y } = this.players[playerId]);
      let player = this.grid[x][y].spiritLayer
      color = player.color
      this.grid[x][y].spiritLayer = null

      // Check if a player now occupies player's old spot: if so, find new spot for player
      if (this.grid[x][y].spaceLayer){
        ({ x, y } = this.findRandomSpot())
      }
      
      this.grid[x][y].spaceLayer = player
    }

    if (!this.players[playerId]){ // new player that's never existed
      ({ x, y } = this.findRandomSpot());
      let newPlayer = new Player(playerId)
      color = newPlayer.color
      this.grid[x][y].spaceLayer = newPlayer
      this.players[playerId] = { x, y, online: true}
    }

    return {
      playerId: playerId,
      action: "add",
      color: color,
      x, y
    }
  }

  removePlayer(playerId){
    
    try {
      if (!this.players[playerId]){
        console.log(`Failed to remove player ${playerId}: they do not exist in the game`)
        return
      }

      let { x, y } = this.players[playerId]
      console.log("Attempting to delete a player with the coords of", x, y)

      if (this.grid[x] && this.grid[x][y]){
        let player = this.grid[x][y].spaceLayer
        this.grid[x][y].spaceLayer = null
        this.grid[x][y].spiritLayer = player
        this.players[playerId].online = false

        return {
          playerId: playerId,
          action: "remove",
          x: x,
          y: y
        }

      } else {
        console.log(`Invalid coordinates (${x}, ${y}) for player with ID ${playerId}`);
      }

    } catch (error) {
      console.log(error)
    }

  }

  tileExists(x, y){
    return x >= 0 && x < this.rows && y >= 0 && y < this.cols
  }

  movePlayer(playerId, direction){
    if(!this.players[playerId] || !this.players[playerId].online){
      console.log("Player does not exist, or is offline, and can't be moved")
      return
    }
    
    const moves = {
      l: [-1, 0],
      r: [1, 0],
      u: [0, 1],
      d: [0, -1]
    }

    let { x, y } = this.players[playerId]
    let player = this.grid[x][y].spaceLayer
    let [dx, dy] = moves[direction]
    const newX = x + dx
    const newY = y + dy
    if (this.tileExists(newX, newY) && !this.grid[newX][newY].spaceLayer){
      this.grid[x][y].spaceLayer = null
      this.grid[newX][newY].spaceLayer = player
      this.players[playerId] = { x: newX, y: newY, online: true}

      return {
        playerId: playerId,
        action: "move",
        x: newX,
        y: newY
      }
      
    }

  }

}

export default GameInstance