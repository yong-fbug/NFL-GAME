import { Tile } from "../game/Tile";

interface Props {
  map: number[][];
  piece: { x: number, y: number };
  TILE_SIZE: number;
  VIEWPORT_WIDTH: number;
  VIEWPORT_HEIGHT: number;
  floor: number;
}

export const GameCanvas: React.FC<Props> = ({
  map,
  piece,
  TILE_SIZE,
  VIEWPORT_HEIGHT,
  VIEWPORT_WIDTH,
  floor,
}) => {
  const offsetX = Math.max(
    0,
    Math.min(piece.x - Math.floor(VIEWPORT_WIDTH / 2), map[0].length - VIEWPORT_WIDTH)
  );
  const offsetY = Math.max(
    0,
    Math.min(piece.y - Math.floor(VIEWPORT_HEIGHT / 2), map.length - VIEWPORT_HEIGHT)
  );

  return (
    <>
      <div>
        <p className="text-white mb-2 text-4xl">Floor: {floor}</p>
      </div>
      <div
        style={{
          display: "grid",
          background: "#333",
          gridTemplateColumns: `repeat(${VIEWPORT_WIDTH}, ${TILE_SIZE}px)`,
          gridTemplateRows: `repeat(${VIEWPORT_HEIGHT}, ${TILE_SIZE}px)`,
        }}
      >
        {map.slice(offsetY, offsetY + VIEWPORT_HEIGHT).map((row, y) =>
          row.slice(offsetX, offsetX + VIEWPORT_WIDTH).map((cell, x) => {
            const isPiece = piece.x === offsetX + x && piece.y === offsetY + y;
            return (
              <Tile
                key={`${offsetX + x}-${offsetY + y}`} // unique keys!
                cell={cell}
                isPiece={isPiece}
                TILE_SIZE={TILE_SIZE}
              />
            );
          })
        )}
      </div>
    </>
  );
};
