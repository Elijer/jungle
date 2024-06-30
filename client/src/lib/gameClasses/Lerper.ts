
export default class Lerper {
  start: number | null;
  duration: number;
  startPos: { x: number; y: number };
  targetPos: { x: number; y: number };

  constructor(){
    this.start = null
    this.duration = 1000
    this.startPos = { x: 0, y: 0 }
    this.targetPos = { x: 0, y: 0 }
  }

  lerp(playerX: number, playerY: number, gridSize: number, camera: THREE.Camera){
    let newTargetPos = { x: playerX - gridSize / 2, y: playerY - gridSize - 7 };
    if (!this.start) {
      this.start = Date.now();
      this.startPos = { x: camera.position.x, y: camera.position.y };
      this.targetPos = newTargetPos;
    } else {
      this.targetPos = newTargetPos; // Update target position continuously
      let now = Date.now();
      let elapsed = now - this.start;
      let t = Math.min(elapsed / this.duration, 1); // Interpolation factor
  
      let newX = this.startPos.x + t * (this.targetPos.x - this.startPos.x);
      let newY = this.startPos.y + t * (this.targetPos.y - this.startPos.y);
  
      camera.position.set(newX, newY, 8);
      if (t === 1) {
        this.start = null; // Reset this.start for the next movement
      }
    }
  }
}