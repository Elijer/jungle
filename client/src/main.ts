import './style.css'
import { Group, PlaneGeometry, Mesh, MeshBasicMaterial, Color} from 'three';
import setupClient from './lib/setupClient.js'
import sceneSetup from './lib/setupScene.js'
import b from './lib/boardConfig.js'
import emphemeralsHandler from './lib/ephemeralsHandler.js'
import { BoardState, LocalBoardState, Entity, EntityStateEvent, KeyBindings, LayerState } from './lib/interfaces.js'
import { hideClassIfTouchDevice, lerp, throttle, gid } from './lib/utilities.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

setupClient.then(({socket, storedPlayerId: playerId}) => {

  socket.on("redundant connection", () => {
    alert("You are already connected in another tab, or device on this IP address.")
  })

  let STREAM_MODE = {
    LOCAL: "LOCAL",
    INITIAL_GLOBAL: "INITIAL_GLOBAL_THEN_LOCAL_UPDATES" // <--- THIS IS BETTER FOR DEBUGGING THE ENTIRE MAP
  }

  let gameconfig = {
    // lerpMode: false, // no camera smoothing
    lerpMode: true, // adds camera smoothing
    postProcessing: false, // adds pixelation effect
    lerpSpeed: .015, // 1 is infinitely fast - no lerp. .04 starts getting pretty delayed.
    inputColdownTime: 60, // cooldown in ms between inputs. Limits player power and network stress.
    cameraPositionrelativeToPlayer: {x: 0, y: 4.5, z: 8},
    streamMode: "Server decides this"
    // streamMode: STREAM_MODE.LOCAL
  }

  socket.on("config", (serverConfig) => {
    gameconfig.streamMode = serverConfig?.streamMode
  })

  let startingTime = Date.now()
  const midmap = b.gridSize / 2 * b.squareSize * b.gapSize

  let timing = {
    interval: 16, // the millisecond interval of 20 times a second. 16 is ~60fps.
    now: startingTime,
    then: startingTime,
    elapsed: startingTime
  }

  let camconfig = {
    y: 12,
    x: midmap,
    z: midmap,
    zOffset: b.squareSize * 20,
    rotation: -.6,
  }

  let terrainTiles: Mesh[] = new Array(b.gridSize * b.gridSize)
  let lastTiles: Mesh[] = []
  const geo = new PlaneGeometry(b.squareSize, b.squareSize)
  const rotate90: number = -(Math.PI / 2)

  let { scene, camera, renderer, composer } = sceneSetup(camconfig.rotation, gameconfig)
  let controls: OrbitControls | null
  let orbitMode = false

  let cameraTargetX = camconfig.x
  let cameraTargetZ = camconfig.z

  hideClassIfTouchDevice('arrow-key-interface')
  let ephemeralsGroup = new Group()
  scene.add(ephemeralsGroup)

  let ephemerals = new emphemeralsHandler(ephemeralsGroup)

  socket.on("redundant connection", () => {
    alert("You are already connected in another tab, or device on this IP address.")
  })

  function enableOrbitControls() {
    if (controls) controls.dispose();
    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();
  }

  function disableOrbitControls() {
    if (controls) {
      controls.dispose();
      controls = null;
    }
  }

  function toggleOrbitControls() {
    orbitMode = !orbitMode;
    if (orbitMode) {
      enableOrbitControls();
      return
    }
    
    disableOrbitControls();

    // Recenter Camera on Player
    let playerId = localStorage.getItem("lightweightId");
    if (playerId) {
      let entity = ephemerals.ephs[playerId];
      let cubePos = entity.cube.position
      camera.position.set(
        cubePos.x + gameconfig.cameraPositionrelativeToPlayer.x,
        cubePos.y + gameconfig.cameraPositionrelativeToPlayer.y,
        cubePos.z + gameconfig.cameraPositionrelativeToPlayer.z
      )
      camera.rotation.set(camconfig.rotation, 0, 0 )
    }

  }

  // ANIMATION LOOP
  let animate = () => {

    // For throttling
    timing.now = Date.now()
    timing.elapsed = timing.now - timing.then
    if (timing.elapsed > timing.interval){

      // Handle Camera Centering
      if (cameraTargetX && cameraTargetZ && !orbitMode){

        if (!gameconfig.lerpMode){
          camconfig.x = cameraTargetX
          camconfig.z = cameraTargetZ
        }

        if (gameconfig.lerpMode){
          camconfig.x = lerp(camera.position.x, cameraTargetX, gameconfig.lerpSpeed);
          camconfig.z = lerp(camera.position.z, cameraTargetZ, gameconfig.lerpSpeed);
        }

        camera.position.set(camconfig.x, camconfig.y, camconfig.z)
      }

      if (gameconfig.postProcessing && composer){
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
      timing.then = timing.now - (timing.elapsed % timing.interval);
    }
    
    requestAnimationFrame(animate)
  }

  function animationThrottler(animationFunction: Function) {
    timing.then = Date.now();
    animationFunction()
  }

  animationThrottler(animate)

  socket.on('localState', (lbs: LocalBoardState): void => {
    if (gameconfig.streamMode !== STREAM_MODE.LOCAL) return

    let terrain, player: LayerState | null

    // This is what clears tiles when you move so that you don't have em trailing behind you
    for (let lt of lastTiles)lt.visible = false
    const staleEphs = new Set([...Object.keys(ephemerals.ephs)])

    const width = lbs.radius * 2 + 1
    for (let i = 0; i < lbs.grid.length; i++){
      const yOffset = Math.floor(i / width)
      const xOffset = i % width
      const y = lbs.relativeTo.y + yOffset - lbs.radius
      const x = lbs.relativeTo.x + xOffset - lbs.radius
      const tile = lbs.grid[i]
      if (!tile || y < 0 || y >= b.gridSize || x < 0 || x >= b.gridSize) continue
      try {
        terrain = tile.terrain
        // const mat = new MeshBasicMaterial({color: 'red'})
        const mat = new MeshBasicMaterial({
          color: new Color(parseInt(terrain?.color ?? '131321', 16)),
          precision: "lowp",
          dithering: true
        })
        const terracotta = new Mesh(geo, mat)
        terracotta.rotation.x = rotate90
        terracotta.position.set(
          (x * b.squareSize * b.gapSize) - b.gridSize * b.squareSize * b.gapSize / 2,
          0,
          y * b.squareSize * b.gapSize
        )
        terrainTiles[i] = terracotta
        lastTiles.push(terracotta) // save the last tiles so that we can sweep em up next time
        scene.add(terracotta)

        player = tile.space
        if (!player) continue
        if (playerId === localStorage.getItem("lightweightId")){

          // TODO - fix type issues
          let {x, y} = player.position
          cameraTargetX = x * b.squareSize - b.gridSize / 2
          cameraTargetZ = y * b.squareSize + camconfig.zOffset
        }
        if (ephemerals.ephs[player.id]){
          ephemerals.moveCube(player.id, player.position.x, player.position.y)
          ephemerals.updateCubeTransparency(player.id, player.layer === "spirit" ? true : false)
          staleEphs.delete(player.id)
        } else {
          ephemerals.createEphemeral(player)
          staleEphs.delete(player.id)
        }

        for (const eph of staleEphs){
          ephemerals.removeEphemeral(eph)
        }

      } catch (e) {
        // console.log("NAH", e)
      }
    }

  })

  socket.on("tileUpdate", (update)=>{
    if (update.event === "removed"){
      ephemerals.removeEphemeral(update.id)
    } else if (update.event === "added"){

      const x = update.tileNumber % b.gridSize
      const y = Math.floor(update.tileNumber / b.gridSize)

      if (ephemerals.ephs[update.id]){
        ephemerals.moveCube(update.id, x, y)
      } else {
        ephemerals.createEphemeral(update.item.space)
      }
    }
  })

  socket.on("state", (boardState: BoardState) => {

    if (gameconfig.streamMode !== STREAM_MODE.INITIAL_GLOBAL) return

    let index, terrain

    for (let x = 0; x < b.gridSize; x++) {
      for (let y = 0; y < b.gridSize; y++) {
        index = x * b.gridSize + y;
        terrain = boardState.grid[x][y].terrain
        const mat = new MeshBasicMaterial({color: new Color(parseInt(terrain?.color ?? 'FFFFFF', 16))})
        const tile = new Mesh(geo, mat)
        tile.rotation.x = rotate90
        tile.position.set(
          (x * b.squareSize * b.gapSize) - b.gridSize * b.squareSize * b.gapSize / 2,
          0,
          y * b.squareSize * b.gapSize
        )
        scene.add(tile)
      }
    }

    for (let playerId in boardState.players) {
      let player: Entity = boardState.players[playerId]
      if (playerId === localStorage.getItem("lightweightId")){
        let {x, y} = player.position
        cameraTargetX = x * b.squareSize - b.gridSize / 2
        cameraTargetZ = y * b.squareSize + camconfig.zOffset
      }
      ephemerals.createEphemeral(player)
    }

  })

  // TO DO: get rid of redundant update state interface
  socket.on("update", (entity: EntityStateEvent) => {
    
    if (gameconfig.streamMode !== STREAM_MODE.INITIAL_GLOBAL) return
    
    if (!entity) return

    if (entity.action === "online"){

      if (!ephemerals.ephs[entity.id]){
        ephemerals.createEphemeral(entity)
      }

      if (ephemerals.ephs[entity.id]){
        ephemerals.updateCubeTransparency(entity.id, false)
      }
    }

    if (entity.action === "offline"){

      if (ephemerals.ephs[entity.id]){
        ephemerals.updateCubeTransparency(entity.id, true)
      }
    }

    if (entity.action === "move"){
      if (entity.id === localStorage.getItem("lightweightId")){
        camconfig.x = entity.position.x - 10
        camconfig.z = entity.position.y
        let {x, y} = entity.position
        cameraTargetX = x * b.squareSize - b.gridSize / 2
        cameraTargetZ = y * b.squareSize + camconfig.zOffset
      }
      ephemerals.moveCube(entity.id, entity.position.x, entity.position.y)
    }

  })

  const keyCommandBindings: { [key: string]: string } = {
    w: 'u',
    s: 'd',
    a: 'l',
    d: 'r'
  }

  document.addEventListener('DOMContentLoaded', () => {

    document.addEventListener('keydown', throttle((event: KeyboardEvent) => {
      if (event.code === "Digit0"){
        toggleOrbitControls()
        return
      }

      const keyName = event.key.toLowerCase();
      if (keyCommandBindings.hasOwnProperty(keyName)) {
        socket.emit("input event", {playerId: playerId, command: keyCommandBindings[keyName]})
        return
      }
    }, gameconfig.inputColdownTime))

    const keyBindings: KeyBindings = {
      "w": { element: gid('up-button')!, code: 'u' },
      "a": { element: gid('left-button')!, code: 'l' },
      "s": { element: gid('down-button')!, code: 'd' },
      "d": { element: gid('right-button')!, code: 'r' },
    };

    for (const key in keyBindings) {
      if (keyBindings.hasOwnProperty(key)) {
        const keyBinding = keyBindings[key];
          keyBinding.element.addEventListener('touchend', () => {
            socket.emit('input event', { playerId: playerId, command: keyBinding.code });
          });
      }
    }
  })

})