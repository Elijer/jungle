import { fileURLToPath } from 'url';
import path from 'path';

export const dirname = (() => {
  const __filename = fileURLToPath(import.meta.url);
  return path.dirname(__filename);
})

export function getTileNumberForCoords(x, y, gridSize){
  return y * gridSize + x
}

// export const GEOMETRY_ENUM = {
//   'plane': 0,
//   'square': 1
// }