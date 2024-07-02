export default class Tile {
  constructor(terrain) {
    this.terrain = terrain
    this.space = null
    this.spirit = null
  }

  getColor(){
    return rgbHex(this.rgb[0] * this.noise, this.rgb[1] * this.noise, this.rgb[2] * this.noise)
  }

  getState(){
    return {
      terrain: this.terrain.getState(),
      space: this.space ? this.space.getState() : null,
      spirit: this.spirit ? this.spirit.getState() : null
    }
  }
  
}