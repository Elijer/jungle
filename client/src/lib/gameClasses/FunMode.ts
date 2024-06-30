export default class FunMode {
  speed: number
  funMode: boolean
  pixelPass: any

  constructor(pixelPass: any){
    this.speed = 1
    this.funMode = false
    this.pixelPass = pixelPass
    document.addEventListener('DOMContentLoaded', () => {

      let funButton = document.getElementById("fun-mode")
      funButton?.addEventListener("click", () => {
        this.funMode = !this.funMode
        funButton.innerHTML = this.funMode ? "woah now" : "fun mode"
      })

    })
  }

  pixelateBySpeed(){
    if (this.funMode){
      this.pixelPass.setPixelSize(8 * this.speed)
    } else {
    this.pixelPass.setPixelSize(1)
    }
  }
  
}