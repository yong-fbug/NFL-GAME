import React, { useEffect, useState } from "react";
import { Tile } from "../game/Tile";

interface Props {
  map: number[][];
  piece: { x: number; y: number };
  VIEWPORT_WIDTH: number;
  VIEWPORT_HEIGHT: number;
  TILE_SIZE: number;
  floor: number;
  WIDTH: number;
  HEIGHT: number;
}

export const GameCanvas: React.FC<Props> = ({
  map,
  piece,
  VIEWPORT_HEIGHT,
  VIEWPORT_WIDTH,
  WIDTH,
  HEIGHT,
}) => {
  const [tileSize, setTileSize] = useState(20);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      const usableWidth = isMobile
        ? window.innerWidth
        : window.innerWidth * 0.5;
      const usableHeight = window.innerHeight;

      const sizeX = usableWidth / VIEWPORT_WIDTH;
      const sizeY = usableHeight / VIEWPORT_HEIGHT;

      setTileSize(Math.floor(Math.min(sizeX, sizeY)));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [VIEWPORT_WIDTH, VIEWPORT_HEIGHT]);

  const wrappedPieceX = Math.floor(piece.x + WIDTH) % WIDTH;
  const wrappedPieceY = Math.floor(piece.y + HEIGHT) % HEIGHT;

  const offsetX = wrappedPieceX - Math.floor(VIEWPORT_WIDTH / 2);
  const offsetY = wrappedPieceY - Math.floor(VIEWPORT_HEIGHT / 2);

  return (
    <div className="flex items-center justify-center h-full w-full overflow-hidden">
      <div
        className="bg-gray-800"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${VIEWPORT_WIDTH}, ${tileSize}px)`,
          gridTemplateRows: `repeat(${VIEWPORT_HEIGHT}, ${tileSize}px)`,
        }}
      >
        {Array.from({ length: VIEWPORT_HEIGHT }).map((_, y) => {
          const rowIndex = (offsetY + y + HEIGHT) % HEIGHT;
          const row = map[rowIndex];

          return Array.from({ length: VIEWPORT_WIDTH }).map((_, x) => {
            const colIndex = (offsetX + x + WIDTH) % WIDTH;
            const cell = row[colIndex];

            const isPiece =
              wrappedPieceX === colIndex && wrappedPieceY === rowIndex;

            return (
              <Tile
                key={`${colIndex}-${rowIndex}`}
                cell={cell}
                isPiece={isPiece}
                TILE_SIZE={tileSize}
                x={colIndex}
                y={rowIndex}
                map={map}
              />
            );
          });
        })}
      </div>
    </div>
  );
};
