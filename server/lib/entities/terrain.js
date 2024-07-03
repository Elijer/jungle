import rgbHex from 'rgb-hex';
import Entity from './entity.js';

export default class Terrain extends Entity {
  static rgb = [50, 40, 40]
  static type = "terrain"

  constructor(cohort, position, noise){
    super(cohort, position, null)
    this.noise = noise
  }

  getColor(){
    return rgbHex(Terrain.rgb[0] * this.noise, Terrain.rgb[1] * this.noise, Terrain.rgb[2] * this.noise)
  }

  getState(){
    return {
      ...super.getState(),
      color: this.getColor()
    }  
  }

}