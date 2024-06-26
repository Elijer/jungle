declare module 'three';
// declare module 'three/addons/controls/OrbitControls.js';
declare module 'uuid';

declare module '*';

// declare module 'three/addons/postprocessing/RenderPass.js'
// declare module 'three/addons/postprocessing/RenderPixelatedPass.js';
// declare module 'three/addons/postprocessing/OutputPass.js';

// declare module 'three/examples/jsm/postprocessing/EffectComposer.js' {
//   import { WebGLRenderer, WebGLRenderTarget, Scene, Camera, ShaderMaterial } from 'three';

//   export class EffectComposer {
//     constructor(renderer: WebGLRenderer, renderTarget?: WebGLRenderTarget);
//     render(delta?: number): void;
//     addPass(pass: Pass): void;
//     setSize(width: number, height: number): void;
//   }

//   export class Pass {
//     enabled: boolean;
//     needsSwap: boolean;
//     clear: boolean;
//     renderToScreen: boolean;
//     setSize(width: number, height: number): void;
//     render(renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget, readBuffer: WebGLRenderTarget, deltaTime?: number, maskActive?: boolean): void;
//   }

//   export class RenderPass extends Pass {
//     constructor(scene: Scene, camera: Camera, overrideMaterial?: ShaderMaterial, clearColor?: string | number | null, clearAlpha?: number);
//   }
// }