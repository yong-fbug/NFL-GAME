// src/game/logic/useMobAI.ts
import type { Mob } from "../entities/Enemy";
import { distance } from "../utils/distance";

interface MoveMobsInput {
  mobs: Mob[];
  playerPos: { x: number; y: number };
  map: number[][];
  WIDTH: number;
  HEIGHT: number;
}

export function moveMobs({ mobs, playerPos, map, WIDTH, HEIGHT }: MoveMobsInput): Mob[] {
  const nextPositions: { x: number; y: number }[] = [];

  return mobs.map((mob) => {
    const mobsDirection = [
      { dx: 0, dy: -1, direction: "up" },
      { dx: 0, dy: 1, direction: "down" },
      { dx: -1, dy: 0, direction: "left" },
      { dx: 1, dy: 0, direction: "right" },
      { dx: 0, dy: 0, direction: "stay" },
    ] as const;

    const dist = distance(playerPos.x, playerPos.y, mob.x, mob.y);
    const visionRadius = 5;

    const behavior: "wander" | "aggro" = dist <= visionRadius ? "aggro" : "wander";
    let choice: (typeof mobsDirection)[number];

    if (behavior === "aggro") {
      const roll = Math.random();
      const dx = playerPos.x - mob.x;
      const dy = playerPos.y - mob.y;

      if (roll < 0.7) {
        if (Math.abs(dx) > Math.abs(dy)) {
          choice = dx > 0 ? mobsDirection[3] : mobsDirection[2];
        } else {
          choice = dy > 0 ? mobsDirection[1] : mobsDirection[0];
        }
      } else {
        if (Math.abs(dx) > Math.abs(dy)) {
          choice = dx > 0 ? mobsDirection[2] : mobsDirection[3];
        } else {
          choice = dy > 0 ? mobsDirection[0] : mobsDirection[1];
        }
      }
    } else {
      choice = mobsDirection[Math.floor(Math.random() * mobsDirection.length)];
    }

    const tryX = (mob.x + choice.dx + WIDTH) % WIDTH;
    const tryY = (mob.y + choice.dy + HEIGHT) % HEIGHT;

    const tile = map[tryY][tryX];
    const overlapsPlayer = tryX === playerPos.x && tryY === playerPos.y;
    const overlapsOtherMob = nextPositions.some(
      (pos) => pos.x === tryX && pos.y === tryY
    );

    if (tile === 0 && !overlapsPlayer && !overlapsOtherMob) {
      nextPositions.push({ x: tryX, y: tryY });
      return { ...mob, x: tryX, y: tryY, direction: choice.direction };
    } else {
      nextPositions.push({ x: mob.x, y: mob.y });
      return mob;
    }
  });
}
