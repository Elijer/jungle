import Item from "./item.js"
import { generateRandomColor } from "../utilities.js"

export default class Player extends Entity {
  constructor(cohort, position, id) {
    super(cohort, position, id)
    this.color = generateRandomColor()
  }
}