export interface Mob {
  id: number
  x: number;
  y: number;
  direction: "up" | "down" | "left" | "right" | "stay";
}

let MOB_ID = 50

export function spawnMobs(
  count: number,
  mapWidth: number,
  mapHeight: number
): Mob[] {
  const mobs: Mob[] = [];
  for (let i = 0; i < count; i++) {
    mobs.push({
      id: MOB_ID++,
      x: Math.floor(Math.random() * mapWidth),
      y: Math.floor(Math.random() * mapHeight),
      direction: "down", // default
    });
  }
  return mobs;
}
