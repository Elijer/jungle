import rgbHex from 'rgb-hex';

export default class Tile {
  constructor(noise) {
    this.rgb = [50, 40, 40]
    this.spaceLayer = null
    this.spiritLayer = null
    this.noise = noise
  }

  getColor(){
    return rgbHex(this.rgb[0] * this.noise, this.rgb[1] * this.noise, this.rgb[2] * this.noise)
  }

  getPortableState(){
    return {
      terrain: this.getColor(),
      spaceLayer: this.spaceLayer ? this.spaceLayer.portableState() : null
    }
  }
  
}