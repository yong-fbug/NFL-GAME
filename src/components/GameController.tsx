import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { generateMap, HEIGHT, WIDTH } from "../game/generateMap";
import { GameCanvas } from "./GameCanvas";

export const GameController = forwardRef((_, ref) => {
  const initial = React.useMemo(() => generateMap(), []);
  const [floor, setFloor] = useState(0);
  const [tileSize, setTileSize] = useState(20);
  const [{ map }, setMap] = useState(initial);

  const [moveState, setMoveState] = useState<{
    from: { x: number; y: number };
    to: { x: number; y: number };
    t: number; // 0 to 1
  }>({
    from: initial.spawn,
    to: initial.spawn,
    t: 1, // done moving
  });

  const VIEWPORT_WIDTH = 20;
  const VIEWPORT_HEIGHT = 20;

  const containerRef = useRef<HTMLDivElement>(null);

  // Resize tiles on window resize
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768; //md
      const height = window.innerHeight;
      const width = isMobile ? window.innerWidth : window.innerWidth * 0.5;

      const maxTileSizeY = height / VIEWPORT_HEIGHT;
      const maxTileSizeX = width / VIEWPORT_WIDTH;

      const newTileSize = Math.floor(Math.min(maxTileSizeX, maxTileSizeY));
      setTileSize(newTileSize);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Keep focus for keyboard input
  useEffect(() => {
    const refCurrent = containerRef.current;
    if (!refCurrent) return;

    const handleBlur = () => refCurrent.focus();
    refCurrent.addEventListener("blur", handleBlur);
    refCurrent.focus();

    return () => refCurrent.removeEventListener("blur", handleBlur);
  }, []);

  // Smooth slide using requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;
    const speed = 5; // tiles per second

    const animate = () => {
      setMoveState((state) => {
        if (state.t >= 1) return state;

        const dist = speed * (1 / 60); // assume ~60fps frame step
        const newT = Math.min(1, state.t + dist);

        return { ...state, t: newT };
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const movePiece = (dx: number, dy: number) => {
    if (moveState.t < 1) return; // Block input while moving

    let newX = moveState.to.x + dx;
    let newY = moveState.to.y + dy;

    const maxX = map[0].length;
    const maxY = map.length;

    let fromX = moveState.to.x;
    let fromY = moveState.to.y;

    //wrap X
    if (newX < 0) newX = maxX - 1;
    else if (newX >= maxX) newX = 0;

    if (newX === 0 && moveState.to.x === maxX - 1) {
      fromX = -1;
    } else if (newX === maxX - 1 && moveState.to.x === 0) {
      fromX = maxX;
    }

    //wrap Y
    if (newY < 0) newY = maxY - 1;
    else if (newY >= maxY) newY = 0;

    if (newY === 0 && moveState.to.y === maxY - 1) {
      fromY = -1;
    } else if (newY === maxY - 1 && moveState.to.y === 0) {
      fromY = maxY;
    }

    const tile = map[newY][newX];

    if (tile === 0) {
      setMoveState({
        from: { x: fromX, y: fromY },
        to: { x: newX, y: newY },
        t: 0,
      });
    } else if (tile === 20 || tile === 21) {
      const changeFloor = generateMap();
      setMap(changeFloor);
      setFloor((prev) => prev + (tile === 20 ? 1 : -1));
      setMoveState({
        from: changeFloor.spawn,
        to: changeFloor.spawn,
        t: 1,
      });
    }
  };

  const doSomething = () => {
    console.log("Stay where you are");
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
      case " ": //space
        doSomething();
        break;
    }
  };

  // Expose to parent
  useImperativeHandle(ref, () => ({ movePiece, floor, doSomething }));

  // Smooth piece position for render
  const smoothPos = {
    x: moveState.from.x + (moveState.to.x - moveState.from.x) * moveState.t,
    y: moveState.from.y + (moveState.to.y - moveState.from.y) * moveState.t,
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ outline: "none" }}
      className="relative h-full w-full"
    >
      <GameCanvas
        map={map}
        piece={smoothPos}
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
