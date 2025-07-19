// src/game/logic/movePiece.ts
import { type Mob } from "../entities/Enemy"
import { generateMap } from "../generateMap";

interface MovePieceInput {
  dx: number;
  dy: number;
  direction: "up" | "down" | "left" | "right" | "stay";
  moveState: {
    from: { x: number; y: number };
    to: { x: number; y: number };
    t: number;
  };
  map: number[][];
  mobs: Mob[];
  WIDTH: number;
  HEIGHT: number;
}

interface MovePieceOutput {
  moveState: MovePieceInput["moveState"];
  newMap?: ReturnType<typeof generateMap>;
  floorChange?: number; // +1 or -1
}

export function movePiece({
  dx,
  dy,
  moveState,
  map,
  mobs,
}: MovePieceInput): MovePieceOutput | null {
  if (moveState.t < 1) return null; // Ignore if still moving

  let newX = moveState.to.x + dx;
  let newY = moveState.to.y + dy;

  const maxX = map[0].length;
  const maxY = map.length;

  let fromX = moveState.to.x;
  let fromY = moveState.to.y;

  if (newX < 0) newX = maxX - 1;
  else if (newX >= maxX) newX = 0;

  if (newX === 0 && moveState.to.x === maxX - 1) {
    fromX = -1;
  } else if (newX === maxX - 1 && moveState.to.x === 0) {
    fromX = maxX;
  }

  if (newY < 0) newY = maxY - 1;
  else if (newY >= maxY) newY = 0;

  if (newY === 0 && moveState.to.y === maxY - 1) {
    fromY = -1;
  } else if (newY === maxY - 1 && moveState.to.y === 0) {
    fromY = maxY;
  }

  const tile = map[newY][newX];
  const mobAtDestination = mobs.some((mob) => mob.x === newX && mob.y === newY);

  if (tile === 0 && !mobAtDestination) {
    return {
      moveState: {
        from: { x: fromX, y: fromY },
        to: { x: newX, y: newY },
        t: 0,
      },
    };
  } else if (tile === 20 || tile === 21) {
    const newMap = generateMap();
    return {
      moveState: {
        from: newMap.spawn,
        to: newMap.spawn,
        t: 1,
      },
      newMap,
      floorChange: tile === 20 ? +1 : -1,
    };
  } else {
    return null; // blocked
  }
}
