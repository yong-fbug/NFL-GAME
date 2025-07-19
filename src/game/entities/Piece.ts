export interface PieceStats {
  name: string;
  health: number;
  mana: number;
  attack: number;
  armor: number;
}

export class Piece {
  x: number;
  y: number;
  stats: PieceStats;

  constructor(x: number, y: number, stats: PieceStats) {
    this.x = x;
    this.y = y;
    this.stats = stats;
  }
}

export interface CharacterProps {
  ctx: CanvasRenderingContext2D;
  drawX: number;
  drawY: number;
  TILE_SIZE: number;
  characterImage: HTMLImageElement;
  direction: "up" | "down" | "left" | "right" | "stay";
}

export function drawCharacter({
  ctx,
  drawX,
  drawY,
  TILE_SIZE,
  characterImage,
  direction,
}: CharacterProps) {
  ctx.save();

  ctx.translate(drawX + TILE_SIZE / 2, drawY + TILE_SIZE / 2);

  let angle = 0;
  switch (direction) {
    case "right":
      angle = -Math.PI / 2;
      break;
    case "left":
      angle = Math.PI / 2;
      break;
    case "up":
      angle = Math.PI;
      break;
    case "down":
      angle = 0;
      break;
    case "stay":
      break;  //null so it move on same tile
  }
  ctx.rotate(angle);

  ctx.drawImage(
    characterImage,
    -TILE_SIZE / 2,
    -TILE_SIZE / 2,
    TILE_SIZE,
    TILE_SIZE
  );
  ctx.restore();
}
