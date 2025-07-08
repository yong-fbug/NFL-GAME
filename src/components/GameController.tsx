import React, { useEffect, useRef, useState } from "react";
import { generateMap } from "../game/generateMap";
import { GameCanvas } from "./GameCanvas";

export const GameController: React.FC = () => {
  const initial = React.useMemo(() => generateMap(), []);
  const [floor, setFloor] = useState(0);    
  const [{ map }, setMap] = useState(initial);
  const [piece, setPiece] = useState(initial.spawn);

  const TILE_SIZE = 20;
  const VIEWPORT_WIDTH = 20;
  const VIEWPORT_HEIGHT = 20;

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ref = containerRef.current;
    if (!ref) return;

    const handleBlur = () => ref.focus()
    ref.addEventListener("blur", handleBlur)

    ref.focus();
    
    return () => ref.removeEventListener("blue", handleBlur);
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
        setFloor(prev => prev + 1);
        const changeFloor = generateMap();
        setMap(changeFloor);
        setPiece(changeFloor.spawn);
      } else if (tile === 21) {
        setFloor(prev => prev - 1);
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

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ outline: "none" }}
      className="inline-block"
    >
      <GameCanvas
        map={map}
        piece={piece}
        TILE_SIZE={TILE_SIZE}
        VIEWPORT_HEIGHT={VIEWPORT_HEIGHT}
        VIEWPORT_WIDTH={VIEWPORT_WIDTH}
        floor={floor}
      />
    </div>
  );
};

