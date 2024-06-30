import type { Socket } from 'socket.io-client'

export default class FunMode {
  speed: number
  funMode: boolean
  pixelPass: any
  movementHandler: Function
  synth: any
  speedCeiling: number

  cooldownPoint: number
  coolingDown: boolean
  cooldownDuration: number
  // cooldown: number
  // coolingDown: boolean
  // cooldownPeriod: number

  constructor(pixelPass: any, movementHandler: Function, synth: any ){
    this.speed = 1
    this.funMode = false
    this.pixelPass = pixelPass
    this.movementHandler = movementHandler
    this.synth = synth
    this.speedCeiling = 4

    this.cooldownPoint = Date.now()
    this.coolingDown = false
    this.cooldownDuration = 1000

    document.addEventListener('DOMContentLoaded', () => {

      let funButton = document.getElementById("fun-mode")
      funButton?.addEventListener("click", () => {
        this.synth.initializeAudio()
        this.funMode = !this.funMode
        funButton.innerHTML = this.funMode ? "woah now" : "fun mode"
      })

        // Buttons
      document.addEventListener("keydown", (event) => {

        if (this.coolingDown){
          if (Date.now() - this.cooldownPoint > this.cooldownDuration){
            this.coolingDown = false
          }

          return
        }

        if (this.speed <= this.speedCeiling && !this.coolingDown){
          this.speed*=1.1
        } else {
          this.cooldownPoint = Date.now()
          this.coolingDown = true
          this.speed = 1
        }
        
        if (this.funMode) this.movementHandler(event, this)
      });

    })
  }

  pixelateBySpeed(){
    if (this.funMode){
      this.pixelPass.setPixelSize(8 * this.speed)
    } else {
    this.pixelPass.setPixelSize(1)
    }
  }

  playSpeedSynth(){
    let volVal = (3 * (this.speed)) - 30
    if (this.funMode) this.synth.playNoteAtVolume(1 - (this.speed * 100), volVal)
  }

}