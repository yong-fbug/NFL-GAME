import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { generateMap, HEIGHT, WIDTH } from "../game/generateMap";
import { GameCanvas } from "./GameCanvas";

export const GameController = forwardRef((props, ref) => {
  const initial = React.useMemo(() => generateMap(), []);
  const [floor, setFloor] = useState(0);
  const [tileSize, setTileSize] = useState(20);
  const [{ map }, setMap] = useState(initial);
  const [piece, setPiece] = useState(initial.spawn);

  const VIEWPORT_WIDTH = 20;
  const VIEWPORT_HEIGHT = 20;

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      const height = window.innerHeight;
      const maxTileSizeY = height / VIEWPORT_HEIGHT;
      const maxTileSizeX = (window.innerWidth * 0.5) / VIEWPORT_WIDTH;
      const newTileSize = Math.min(maxTileSizeX, maxTileSizeY);
      setTileSize(newTileSize);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const refCurrent = containerRef.current;
    if (!refCurrent) return;

    const handleBlur = () => refCurrent.focus();
    refCurrent.addEventListener("blur", handleBlur);
    refCurrent.focus();

    return () => refCurrent.removeEventListener("blur", handleBlur);
  }, []);

  const movePiece = (dx: number, dy: number) => {
    let newX = piece.x + dx;
    let newY = piece.y + dy;

    const maxX = map[0].length;
    const maxY = map.length;

    if (newX < 0) newX = maxX - 1;
    else if (newX >= maxX) newX = 0;

    if (newY < 0) newY = maxY - 1;
    else if (newY >= maxY) newY = 0;

    const tile = map[newY][newX];

    if (tile === 0) {
      setPiece({ x: newX, y: newY });
    } else if (tile === 20) {
      setFloor((prev) => prev + 1);
      const changeFloor = generateMap();
      setMap(changeFloor);
      setPiece(changeFloor.spawn);
    } else if (tile === 21) {
      setFloor((prev) => prev - 1);
      const changeFloor = generateMap();
      setMap(changeFloor);
      setPiece(changeFloor.spawn);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    switch (e.key) {
      case "ArrowUp":
        movePiece(0, -1);
        break;
      case "ArrowDown":
        movePiece(0, 1);
        break;
      case "ArrowLeft":
        movePiece(-1, 0);
        break;
      case "ArrowRight":
        movePiece(1, 0);
        break;
    }
  };

  //Make movePiece available to parent
  useImperativeHandle(ref, () => ({ movePiece }));

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ outline: "none" }}
      className="h-full w-full"
    >
      <GameCanvas
        map={map}
        piece={piece}
        TILE_SIZE={tileSize}
        VIEWPORT_HEIGHT={VIEWPORT_HEIGHT}
        VIEWPORT_WIDTH={VIEWPORT_WIDTH}
        floor={floor}
        WIDTH={WIDTH}
        HEIGHT={HEIGHT}
      />
    </div>
  );
});
