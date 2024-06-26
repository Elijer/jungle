import Item from "./item.js"
import { generateRandomColor } from "../utilities.js"

export default class Player extends Item {
  constructor(id) {
    super(id)
    this.color = generateRandomColor()
  }
}