import { fileURLToPath } from 'url';
import path from 'path';

export const generateRandomColor = () => {
  return `${Math.floor(Math.random()*16777215).toString(16)}`
}

export const dirname = (() => {
  const __filename = fileURLToPath(import.meta.url);
  return path.dirname(__filename);
})