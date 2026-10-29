import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { events } from './calendar.ts';
const imageExists = (path: string) => existsSync(resolve('public', path));

export const availableImages = events
  .filter((event) => event.image && imageExists(event.image))
  .map((event) => event.image);
export const missingImages = events
  .filter((event) => event.image && !imageExists(event.image))
  .map((event) => event.image);
