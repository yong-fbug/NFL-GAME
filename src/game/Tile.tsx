import React from "react";

interface TileProps {
  cell: number;
  isPiece: boolean;
  TILE_SIZE: number;
}

export const Tile: React.FC<TileProps> = React.memo(({ cell, isPiece, TILE_SIZE }) => {
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
        cell === 1
          ? "bg-gray-900" // wall
          : cell === 0
          ? "bg-gray-600" // walkable
          : ""
      }`}
    >
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
});
