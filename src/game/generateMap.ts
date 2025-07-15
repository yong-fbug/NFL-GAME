export const WIDTH = 50;
export const HEIGHT = 50;

//0 walkable, 1 wall, 21 -, 20 +
type Tile = 0 | 1 | 2 | 21 | 20;

export function generateMap(): {
  map: Tile[][];
  spawn: { x: number; y: number };
} {
  const map: Tile[][] = Array.from({ length: HEIGHT }, () =>
    Array.from({ length: WIDTH }, () => 0)
  );

  const smallTreeChance = 0.1;
  for (let x = 0; x < HEIGHT; x++) {
    for (let y = 0; y < WIDTH; y++) {
      if (Math.random() < smallTreeChance) {
        map[y][x] = 1;
      }
    }
  }

  const largeTreeChance = Math.floor(WIDTH * HEIGHT * 0.01);
  for (let i = 0; i < largeTreeChance; i++) {
    const x = Math.floor(Math.random() * (WIDTH - 1));
    const y = Math.floor(Math.random() * (HEIGHT - 1));

    map[y][x] = 2;
    map[y][x + 1] = 2;
    map[y + 1][x] = 2;
    map[y + 1][x + 1] = 2;
  }

  const validSpotsStairs: { x: number; y: number }[] = [];
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (map[y][x] === 0) {
        validSpotsStairs.push({ x, y });
      }
    }
  }

  const STAIRS_TYPES: Tile[] = [20, 21];
  for (const type of STAIRS_TYPES) {
    if (validSpotsStairs.length === 0)
      throw new Error("No space left for stairs");
    const idx = Math.floor(Math.random() * validSpotsStairs.length);
    const spot = validSpotsStairs.splice(idx, 1)[0];
    map[spot.y][spot.x] = type;
  }

  let spawn = { x: 1, y: 1 };
  while (true) {
    const x = Math.floor(Math.random() * WIDTH);
    const y = Math.floor(Math.random() * HEIGHT);

    if (map[y][x] !== 0) continue;

    const hasOpenSpace = [
      map[y - 1]?.[x],
      map[y + 1]?.[x],
      map[y]?.[x - 1],
      map[y]?.[x + 1],
    ].some((tile) => tile === 0);

    if (hasOpenSpace) {
      spawn = { x, y };
      break;
    }
  }

  return { map, spawn };
}
