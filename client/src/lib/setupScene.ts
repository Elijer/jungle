import { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, MeshBasicMaterial, PlaneGeometry, Mesh, DoubleSide } from 'three';

// Post processing
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';

import b from './boardConfig.js'

const sceneSetup = (cameraRotation: number, performanceConfig: any) => {

  // const terrainTiles: any = []

  const scene = new Scene();
  const camera = new PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 );
  const renderer = new WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild( renderer.domElement );

  // 45 degree view
  camera.position.x = b.gridSize / 2; // x centers the board
  camera.position.z = b.gridSize / 2; // gridSize / 2 centers the board on the z axis
  camera.position.y = 30; // Puts us 30 above
  camera.rotation.x = cameraRotation; // Tilt the camera down a bit

  // Add light
  const ambientLight = new AmbientLight(0x404040);
  scene.add(ambientLight);

  let composer
  if (performanceConfig.postProcessing){

    composer = new EffectComposer( renderer );
  
    const renderPass = new RenderPass( scene, camera );
    composer.addPass( renderPass );
    
    const pixelPass = new RenderPixelatedPass(4, scene, camera);
    composer.addPass( pixelPass );
    
    const outputPass = new OutputPass();
    composer.addPass( outputPass );
    composer.render()



  } else {
    renderer.render(scene, camera);
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

    // return {scene, camera, renderer, terrainTiles, composer }
    return {scene, camera, renderer, composer}
}

export default sceneSetup