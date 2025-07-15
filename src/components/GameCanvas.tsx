
import { Tile } from "../game/Tile";

interface Props {
  map: number[][];
  piece: { x: number, y: number };
  TILE_SIZE: number;
  VIEWPORT_WIDTH: number;
  VIEWPORT_HEIGHT: number;
  floor: number;
  WIDTH: number;
  HEIGHT: number;
}

export const GameCanvas: React.FC<Props> = ({
  map,
  piece,
  TILE_SIZE,
  VIEWPORT_HEIGHT,
  VIEWPORT_WIDTH,
  // floor,
  WIDTH,
  HEIGHT,
}) => {

  const wrappedPieceX = (piece.x + WIDTH) % WIDTH;
  const wrappedPieceY = (piece.y + HEIGHT) % HEIGHT;

  const offsetX = wrappedPieceX - Math.floor(VIEWPORT_WIDTH / 2);
  const offsetY = wrappedPieceY - Math.floor(VIEWPORT_HEIGHT / 2);

  return (
    <div className="flex items-center justify-center h-full w-full overflow-hidden">
      <div className="bg-gray-800"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${VIEWPORT_WIDTH}, ${TILE_SIZE}px)`,
          gridTemplateRows: `repeat(${VIEWPORT_HEIGHT}, ${TILE_SIZE}px)`,
        }}
      >
        { Array.from({ length: VIEWPORT_HEIGHT }).map((_, y) => {
          const rowIndex = (offsetY + y + HEIGHT) % HEIGHT;
          const row = map[rowIndex];

          return Array.from({ length: VIEWPORT_WIDTH }).map((_, x) => {
            const colIndex = (offsetX + x + WIDTH) % WIDTH;
            const cell = row[colIndex];

            const isPiece = wrappedPieceX === colIndex && wrappedPieceY === rowIndex;

            return (
              <Tile 
                key={`${colIndex}${rowIndex}`}
                cell={cell}
                isPiece={isPiece}
                TILE_SIZE={TILE_SIZE}
                x={colIndex}
                y={rowIndex}
                map={map}
              
              />
            );
          })
        })}
      </div>
    </div>
  );
};
