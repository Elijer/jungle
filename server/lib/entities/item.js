export default class Item {
  constructor(id) {
    this.id = id
    this.color = "pink"
    this.geometry = "cube"
  }

  portableState(){
    return {
      color: this.color,
      geometry: this.geometry
    }
  }
}