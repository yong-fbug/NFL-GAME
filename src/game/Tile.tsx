//ready to delete this file
import React from "react";

interface TileProps {
  cell: number;
  isPiece: boolean;
  TILE_SIZE: number;
  x: number;
  y: number;
  map: number[][];
}

export const Tile: React.FC<TileProps> = React.memo(
  ({ cell, isPiece, TILE_SIZE, x, y, map }) => {
    // Detect top-left of 2x2 tree
    const isTopLeftOfLargeTree =
      cell === 2 &&
      map[y]?.[x + 1] === 2 &&
      map[y + 1]?.[x] === 2 &&
      map[y + 1]?.[x + 1] === 2 &&
      map[y - 1]?.[x] !== 2 &&
      map[y]?.[x - 1] !== 2;

    return (
      <div
        style={{
          width: `${TILE_SIZE}px`,
          height: `${TILE_SIZE}px`,
          position: "relative",
          background:
            cell === 20
              ? "radial-gradient(circle, #a855f7, #6b21a8)"
              : cell === 21
              ? "radial-gradient(circle, #3b82f6, #1e3a8a)"
              : undefined,
        }}
        className={`border border-gray-700 ${
          cell === 2
            ? "border"
            : cell === 1
            ? "bg-red-800 border-none"
            : cell === 0
            ? "bg-gray-600"
            : ""
        }`}
      >
        {cell === 2 && isTopLeftOfLargeTree && (
          <div
            className="absolute bg-gray-850 rounded-full shadow-inner"
            style={{
              width: `${TILE_SIZE * 2 - 1}px`,
              height: `${TILE_SIZE * 2 - 1.5}px`,
              top: 0,
              left: 0,
              overflow: "visible",
              zIndex: 10,
              pointerEvents: "none",
            }}
          />
        )}

        {isPiece && (
          <div
            className="bg-amber-700 shadow-md"
            style={{
              position: "absolute",
              width: "80%",
              height: "80%",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              borderRadius: "9999px",
            }}
          />
        )}
      </div>
    );
  }
);
