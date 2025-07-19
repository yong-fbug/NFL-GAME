import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { generateMap, HEIGHT, WIDTH } from "../game/generateMap";
import { GameCanvas } from "./GameCanvas";
import { spawnMobs, type Mob } from "../game/entities/Enemy";

export const GameController = forwardRef((_, ref) => {
  const initial = React.useMemo(() => generateMap(), []);
  const [floor, setFloor] = useState(0);
  const [tileSize, setTileSize] = useState(20);
  const [{ map }, setMap] = useState(initial);
  const [mobs, setMobs] = useState<Mob[]>(() => spawnMobs(3, WIDTH, HEIGHT));
  const [moveState, setMoveState] = useState<{
    from: { x: number; y: number };
    to: { x: number; y: number };
    t: number; // 0 to 1
  }>({
    from: initial.spawn,
    to: initial.spawn,
    t: 1, // done moving
  });

  //sice of entire map
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

      //here is important for TURN-BASED
      moveMobs();
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

  // Character will face base on direction
  const directionRef = useRef<"up" | "down" | "left" | "right">("down");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    switch (e.key) {
      case "ArrowUp":
        directionRef.current = "up";
        movePiece(0, -1);
        break;
      case "ArrowDown":
        directionRef.current = "down";
        movePiece(0, 1);
        break;
      case "ArrowLeft":
        directionRef.current = "left";
        movePiece(-1, 0);
        break;
      case "ArrowRight":
        directionRef.current = "right";
        movePiece(1, 0);
        break;
      case " ": //space
        doSomething();
        break;
    }
  };

  // Expose to parent
  useImperativeHandle(ref, () => ({
    movePiece: (
      dx: number,
      dy: number,
      dir?: "up" | "down" | "left" | "right"
    ) => {
      if (dir) directionRef.current = dir;
      movePiece(dx, dy);
    },
    floor,
    doSomething,
  }));

  // Smooth piece position for render
  const smoothPos = {
    x: moveState.from.x + (moveState.to.x - moveState.from.x) * moveState.t,
    y: moveState.from.y + (moveState.to.y - moveState.from.y) * moveState.t,
  };

  //mobs movement
  const moveMobs = () => {
    setMobs((prev) =>
      prev.map((mob) => {
        const mobsDirection: {
          dx: number;
          dy: number;
          direction: "up" | "down" | "left" | "right";
        }[] = [
          { dx: 0, dy: -1, direction: "up" }, // up
          { dx: 0, dy: 1, direction: "down" }, // down
          { dx: -1, dy: 0, direction: "left" }, // left
          { dx: 1, dy: 0, direction: "right" }, // right
        ];

        let attempts = 0;
        let newX = mob.x;
        let newY = mob.y;
        let newDir = mob.direction;

        while (attempts < 10) {
          const choice =
            mobsDirection[Math.floor(Math.random() * mobsDirection.length)];

          const tryX = (mob.x + choice.dx + WIDTH) % WIDTH;
          const tryY = (mob.y + choice.dy + HEIGHT) % HEIGHT;

          const tile = map[tryY][tryX];

          // ✅ prevent mobs stepping on player
          const overlapsPlayer =
            tryX === Math.floor(piece.x) && tryY === Math.floor(piece.y);

          if (tile === 0 && !overlapsPlayer) {
            newX = tryX;
            newY = tryY;
            newDir = choice.direction;
            break;
          }

          attempts++;
        }

        return {
          ...mob,
          x: newX,
          y: newY,
          direction: newDir,
        };
      })
    );
  };

  // function getDirectionFromDelta(
  //   dx: number,
  //   dy: number
  // ): "up" | "down" | "left" | "right" {
  //   if (dx === 0 && dy === -1) return "up";
  //   if (dx === 0 && dy === 1) return "down";
  //   if (dx === -1 && dy === 0) return "left";
  //   if (dx === 1 && dy === 0) return "right";
  //   return "down";
  // }

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
        mobs={mobs}
        TILE_SIZE={tileSize}
        VIEWPORT_HEIGHT={VIEWPORT_HEIGHT}
        VIEWPORT_WIDTH={VIEWPORT_WIDTH}
        floor={floor}
        WIDTH={WIDTH}
        HEIGHT={HEIGHT}
        direction={directionRef.current}
      />
    </div>
  );
});
