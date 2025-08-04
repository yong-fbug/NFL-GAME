import { Temporal } from "@js-temporal/polyfill";

export interface PieceStats {
  id: number;
  name: string;
  health: number;
  maxHealth: number;
  mana: number;
  attack: number;
  armor: number;
  range: number;
}

export function generateBasePieceStats(): PieceStats {
  const health = 100 + Math.floor(Math.random() * 5);
  return {
    id: PieceSignature(1),
    name: "CAS",
    health,
    maxHealth: health,
    mana: 50 + Math.floor(Math.random() * 5),
    attack: 10 + Math.floor(Math.random() * 3),
    armor: 5,
    range: 1,
  };
}

export function PieceSignature(id: number) {
  const now = Temporal.Now.instant().epochMilliseconds;
  let value = now + id * 9999;

  for (let i = 0; i < 1000; i++) {
    value = (value * 31 + i * 7) % 1000000000;
  }
  return value;
}

export function levelUpPiece(stats: PieceStats, points: { attack?: number; health?: number }) {
  if (points.attack) stats.attack += points.attack * 5;
  if (points.health) stats.health += points.health * 20;
}
