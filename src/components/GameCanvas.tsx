import React, { useEffect, useRef } from "react";
import { VisionOverlay } from "./VisionOverlay";
import Character_Piece from "../assets/Piece_img_v1.png";
import first_mobs from "../assets/Piece_img_default.png";
import { drawCharacter } from "../game/entities/Piece";
import type { Mob } from "../game/entities/Enemy";

interface Props {
  map: number[][];
  piece: { x: number; y: number };
  mobs: Mob[];
  VIEWPORT_WIDTH: number;
  VIEWPORT_HEIGHT: number;
  TILE_SIZE: number;
  floor: number;
  WIDTH: number;
  HEIGHT: number;
  direction: "up" | "down" | "left" | "right" | "stay";
}

export const GameCanvas: React.FC<Props> = ({
  map,
  piece,
  mobs,
  VIEWPORT_HEIGHT,
  VIEWPORT_WIDTH,
  TILE_SIZE,
  WIDTH,
  HEIGHT,
  direction,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const enemyImageRef = useRef<HTMLImageElement | null>(null);
  const characterImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = Character_Piece;
    characterImageRef.current = img;
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = first_mobs;
    enemyImageRef.current = img;
  }, []);

  const wrappedPieceX = Math.floor(piece.x + WIDTH) % WIDTH;
  const wrappedPieceY = Math.floor(piece.y + HEIGHT) % HEIGHT;

  const offsetX = wrappedPieceX - Math.floor(VIEWPORT_WIDTH / 2);
  const offsetY = wrappedPieceY - Math.floor(VIEWPORT_HEIGHT / 2);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < VIEWPORT_HEIGHT; y++) {
      const rowIndex = (offsetY + y + HEIGHT) % HEIGHT;
      for (let x = 0; x < VIEWPORT_WIDTH; x++) {
        const colIndex = (offsetX + x + WIDTH) % WIDTH;
        const cell = map[rowIndex][colIndex];
        const drawX = x * TILE_SIZE;
        const drawY = y * TILE_SIZE;

        //Background
        if (cell === 0) {
          ctx.fillStyle = "#4B5563"; // bg-gray-600
          ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);

          ctx.strokeStyle = "#1F2937";
          ctx.lineWidth = 2;
          ctx.strokeRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
        } else if (cell === 1) {
          ctx.fillStyle = "#1F2937"; // bg-gray-800
        } else if (cell === 2) {
          ctx.fillStyle = "#1F2937";

          ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
        } else if (cell === 20) {
          const grad = ctx.createRadialGradient(
            drawX + TILE_SIZE / 2,
            drawY + TILE_SIZE / 2,
            0,
            drawX + TILE_SIZE / 2,
            drawY + TILE_SIZE / 2,
            TILE_SIZE / 2
          );
          grad.addColorStop(0, "#a855f7");
          grad.addColorStop(1, "#6b21a8");
          ctx.fillStyle = grad;
        } else if (cell === 21) {
          const grad = ctx.createRadialGradient(
            drawX + TILE_SIZE / 2,
            drawY + TILE_SIZE / 2,
            0,
            drawX + TILE_SIZE / 2,
            drawY + TILE_SIZE / 2,
            TILE_SIZE / 2
          );
          grad.addColorStop(0, "#3b82f6");
          grad.addColorStop(1, "#1e3a8a");
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = "#1F2937";
          ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
        }
        ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);

        // 2x2 tile  (draw only once)
        const isTopLeftOfLargeTree =
          cell === 2 &&
          map[rowIndex][(colIndex + 1) % WIDTH] === 2 &&
          map[(rowIndex + 1) % HEIGHT][colIndex] === 2 &&
          map[(rowIndex + 1) % HEIGHT][(colIndex + 1) % WIDTH] === 2 &&
          map[(rowIndex - 1 + HEIGHT) % HEIGHT][colIndex] !== 2 &&
          map[rowIndex][(colIndex - 1 + WIDTH) % WIDTH] !== 2;

        if (isTopLeftOfLargeTree) {
          ctx.beginPath();
          ctx.arc(
            drawX + TILE_SIZE,
            drawY + TILE_SIZE,
            TILE_SIZE,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }

        if (wrappedPieceX === colIndex && wrappedPieceY === rowIndex) {
          if (characterImageRef.current) {
            drawCharacter({
              ctx,
              drawX,
              drawY,
              TILE_SIZE,
              direction,
              characterImage: characterImageRef.current,
            });
          } else {
            // fallback circle while loading
            ctx.fillStyle = "#92400E";
            ctx.beginPath();
            ctx.arc(
              drawX + TILE_SIZE / 2,
              drawY + TILE_SIZE / 2,
              TILE_SIZE * 0.4,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        }
        //MOBS
        mobs.forEach((mob) => {
          const wrappedMobX = (mob.x + WIDTH) % WIDTH;
          const wrappedMobY = (mob.y + HEIGHT) % HEIGHT;

          const drawX = (wrappedMobX - offsetX + WIDTH) % WIDTH;
          const drawY = (wrappedMobY - offsetY + HEIGHT) % HEIGHT;

          if (
            drawX >= 0 &&
            drawX < VIEWPORT_WIDTH &&
            drawY >= 0 &&
            drawY < VIEWPORT_HEIGHT
          ) {
            drawCharacter({
              ctx,
              drawX: drawX * TILE_SIZE,
              drawY: drawY * TILE_SIZE,
              TILE_SIZE,
              characterImage: enemyImageRef.current!,
              direction: mob.direction,
            });
          }
        });
      }
    }
  }, [
    map,
    wrappedPieceX,
    wrappedPieceY,
    mobs,
    offsetX,
    offsetY,
    VIEWPORT_WIDTH,
    VIEWPORT_HEIGHT,
    TILE_SIZE,
    WIDTH,
    HEIGHT,
    direction,
  ]);

  return (
    <div className="relative flex items-center justify-center overflow-hidden">
      <div
        style={{
          width: `${VIEWPORT_WIDTH * TILE_SIZE}px`,
          height: `${VIEWPORT_HEIGHT * TILE_SIZE}px`,
        }}
      >
        <canvas
          ref={canvasRef}
          width={VIEWPORT_WIDTH * TILE_SIZE}
          height={VIEWPORT_HEIGHT * TILE_SIZE}
          className="block"
        />
        <VisionOverlay
          pieceX={wrappedPieceX - offsetX}
          pieceY={wrappedPieceY - offsetY}
          tileSize={TILE_SIZE}
          visionRadius={3}
          viewportHeight={VIEWPORT_HEIGHT}
          viewportWidth={VIEWPORT_WIDTH}
        />
      </div>
    </div>
  );
};
