import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@': '/src',
      'uuid': 'uuid/dist/esm-browser/index.js',
      'three': 'three/build/three.module.js'
    }
  }
});