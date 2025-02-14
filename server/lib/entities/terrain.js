import rgbHex from 'rgb-hex';
import Entity from './entity.js';

export default class Terrain extends Entity {
  // static rgb = [120, 60, 120]
  static rgb = [90, 120, 200]
  static type = "terrain"

  constructor(cohort, position, grid, id, noise){
    super(cohort, position, grid, id, "terrain")
    this.noise = noise
  }

  getColor(){
    return "0x" + rgbHex(Terrain.rgb[0] * this.noise, Terrain.rgb[1] * this.noise, Terrain.rgb[2] * this.noise)
  }

  getState(action = "none"){
    let payload =  {
      ...super.getState(action),
      color: this.getColor(),
    }
    this.stateSchema.validateSync(payload)
    return payload
  }

}