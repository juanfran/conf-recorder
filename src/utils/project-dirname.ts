import { resolve } from 'path';
import { fileURLToPath } from 'url';

export function projectDirname() {
  return resolve(import.meta.dirname, '../..');
}
