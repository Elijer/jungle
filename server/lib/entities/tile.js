import rgbHex from 'rgb-hex';

export default class Tile {
  constructor(noise) {
    this.noise = noise
    this.rgb = [50, 40, 40]
  }

  getColor(){
    return rgbHex(this.rgb[0] * this.noise, this.rgb[1] * this.noise, this.rgb[2] * this.noise)
  }
}