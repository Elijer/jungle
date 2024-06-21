import { generateRandomColor } from "../utilities.js"

export default class Item {
  constructor(id) {
    this.id = id
    this.color = generateRandomColor()
    this.geometry = "square"
  }

  portableState(){
    return {
      color: this.color,
      geometry: this.geometry
    }
  }
}