import { Noise } from 'noisejs';

export const CHUNK_SIZE = 25;
export const WIDTH = CHUNK_SIZE;
export const HEIGHT = CHUNK_SIZE;

export type Tile = 0 | 1 | 2 | 20 | 21; // 0=walkable, 1=tree, 2=water, 20/21=stairs
export type Biome = 'grassland' | 'desert' | 'snow' | 'water';

const noise = new Noise(Math.random());

export function generateMap(): {
  map: Tile[][];
  biomeMap: Biome[][];
  spawn: { x: number; y: number };
} {
  const map: Tile[][] = Array.from({ length: HEIGHT }, () =>
    new Array(WIDTH).fill(0)
  );
  const biomeMap: Biome[][] = Array.from({ length: HEIGHT }, () =>
    new Array(WIDTH).fill('grassland')
  );

  // === BIOME GENERATION (reduced water chance) ===
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const n = noise.perlin2(x / 8, y / 8);
      const biome: Biome =
        n < -0.35 ? 'water' : n < 0.2 ? 'grassland' : n < 0.45 ? 'desert' : 'snow';
      biomeMap[y][x] = biome;

      if (biome === 'water') map[y][x] = 2; // mark water as unwalkable
    }
  }

  // === ORGANIC FOREST / TREE CLUSTERING ===
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (biomeMap[y][x] !== 'grassland' || map[y][x] !== 0) continue;

      const base = noise.perlin2(x / 4, y / 4);
      const detail = noise.perlin2(x / 1.8, y / 1.8) * 0.4;
      const forestDensity = base + detail;

      const treeThreshold = 0.3 + Math.random() * 0.1;
      if (forestDensity > treeThreshold) {
        map[y][x] = 1; // tree
      }
    }
  }

  // === RARE TREES IN NON-GRASS BIOMES ===
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (
        (biomeMap[y][x] === 'snow' || biomeMap[y][x] === 'desert') &&
        map[y][x] === 0 &&
        Math.random() < 0.015
      ) {
        map[y][x] = 1;
      }
    }
  }

  // === STAIRS (20, 21) ===
  const walkables: { x: number; y: number }[] = [];
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (map[y][x] === 0) walkables.push({ x, y });
    }
  }

  const STAIRS_TYPES: Tile[] = [20, 21];
  for (const type of STAIRS_TYPES) {
    const idx = Math.floor(Math.random() * walkables.length);
    const { x, y } = walkables.splice(idx, 1)[0];
    map[y][x] = type;
  }

  // === SPAWN POINT ===
  let spawn: { x: number; y: number } | undefined;
  for (let i = 0; i < 1000; i++) {
    const x = Math.floor(Math.random() * WIDTH);
    const y = Math.floor(Math.random() * HEIGHT);

    if (map[y][x] !== 0) continue;

    const hasRoom =
      (y > 0 && map[y - 1][x] === 0) ||
      (y < HEIGHT - 1 && map[y + 1][x] === 0) ||
      (x > 0 && map[y][x - 1] === 0) ||
      (x < WIDTH - 1 && map[y][x + 1] === 0);

    if (hasRoom) {
      spawn = { x, y };
      break;
    }
  }

  if (!spawn) throw new Error('Failed to find spawn');

  return { map, biomeMap, spawn };
}
