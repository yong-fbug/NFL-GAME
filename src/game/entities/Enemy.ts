import { Temporal } from "@js-temporal/polyfill";

let globalBornId = 1; // 🔑 This stays alive forever for the whole game

export interface Mob {
  bornId: number;
  id: number;
  x: number;
  y: number;
  direction: "up" | "down" | "left" | "right" | "stay";
  stats: {
    attack: number;
    magic: boolean;
    health: number;
    maxHealth: number;
    armor: number;
    range: number; // 1-3
  };
  damageDisplay?: {
    value: number;
    timer: number;
    timestamp: number;
  }
}

export function spawnMobs(
  floor: number,
  count: number,
  mapWidth: number,
  mapHeight: number,
  currentTotal: number = 0,
): Mob[] {
  console.log("SPAWN CALL → currentTotal:", currentTotal);
  const mobs: Mob[] = [];
  const spaceLeft = Math.max(0, 20 - currentTotal);
  const mobsMaxCount = Math.min(count, spaceLeft);

  console.log("Space left:", spaceLeft, "Will spawn:", mobsMaxCount);

  if (mobsMaxCount <= 0) {
    console.log("Mobs max limit hit. No spawn.");
    return [];
  }

  for (let i = 0; i < mobsMaxCount; i++) {
    const sig = computeMobsSignature(floor, i);
    console.log("SIG:", sig);

    const stats = statsFromSignature(sig);
    mobs.push({
      bornId: globalBornId++, //Unique & permanent
      id: sig,
      x: Math.floor(Math.random() * mapWidth),
      y: Math.floor(Math.random() * mapHeight),
      direction: "down",
      stats,
    });
  }
  return mobs;
}

function computeMobsSignature(floor: number, index: number): number {
  const now = Temporal.Now.instant().epochMilliseconds;
  let value = now + floor * 9999 + index * 777;

  for (let i = 0; i < 10000; i++) {
    value = (value * 31 + i * 7) % 1000000000;
  }
  return value;
}

function statsFromSignature(sig: number) {
  const attack = 10 + ((sig >> 2) % 20);
  const health = 50 + (sig % 100);
  const armor = 5 + ((sig >> 3) % 1);
  const magic = 1 + (sig % 2) === 0;
  const range = 1 + (sig % 3);

  return { attack, health, armor, magic, range, maxHealth: health };
}
