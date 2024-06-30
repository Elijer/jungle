export default class FunMode {
  speed: number
  funMode: boolean

  constructor(){
    this.speed = 1
    this.funMode = false
    document.addEventListener('DOMContentLoaded', () => {

      let funButton = document.getElementById("fun-mode")
      funButton?.addEventListener("click", () => {
        this.funMode = !this.funMode
        funButton.innerHTML = this.funMode ? "woah now" : "fun mode"
      })

    })
  }
}