import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { generateMap, HEIGHT, WIDTH } from "../game/generateMap";
import { GameCanvas } from "./GameCanvas";
import { spawnMobs } from "../game/entities/Enemy";
import { moveMobs } from "../game/logic/useMobAI";
import { movePiece as movePieceLogic } from "../game/logic/movePiece";

export const GameController = forwardRef((_, ref) => {
  const initial = React.useMemo(() => generateMap(), []);
  const [floor, setFloor] = useState(0);
  const [tileSize, setTileSize] = useState(20);
  const [{ map }, setMap] = useState(initial);
  const [mobs, setMobs] = useState(() => spawnMobs(3, WIDTH, HEIGHT));
  const [moveState, setMoveState] = useState({
    from: initial.spawn,
    to: initial.spawn,
    t: 1,
  });

  const VIEWPORT_WIDTH = 20;
  const VIEWPORT_HEIGHT = 20;

  const containerRef = useRef<HTMLDivElement>(null);
  const directionRef = useRef<"up" | "down" | "left" | "right" | "stay">("down");

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      const height = window.innerHeight;
      const width = isMobile ? window.innerWidth : window.innerWidth * 0.5;
      const maxTileSizeY = height / VIEWPORT_HEIGHT;
      const maxTileSizeX = width / VIEWPORT_WIDTH;
      setTileSize(Math.floor(Math.min(maxTileSizeX, maxTileSizeY)));
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

  useEffect(() => {
    let id: number;
    const speed = 6;
    const animate = () => {
      setMoveState((state) => {
        if (state.t >= 1) return state;
        const dist = speed * (1 / 60);
        return { ...state, t: Math.min(1, state.t + dist) };
      });
      id = requestAnimationFrame(animate);
    };
    id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, []);

  const movePiece = (dx: number, dy: number, dir: typeof directionRef.current) => {
    directionRef.current = dir;
    const result = movePieceLogic({
      dx, dy, direction: dir, moveState, map, mobs, WIDTH, HEIGHT
    });
    if (!result) return;
    if (result.newMap) {
      setMap(result.newMap);
      setFloor(floor + (result.floorChange ?? 0));
    }
    setMoveState(result.moveState);
    const playerPos = result.moveState.to;
    setMobs(prev => moveMobs({ mobs: prev, playerPos, map, WIDTH, HEIGHT }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    switch (e.key) {
      case "ArrowUp": return movePiece(0, -1, "up");
      case "ArrowDown": return movePiece(0, 1, "down");
      case "ArrowLeft": return movePiece(-1, 0, "left");
      case "ArrowRight": return movePiece(1, 0, "right");
      case " ": return movePiece(0, 0, "stay");
    }
  };

  useImperativeHandle(ref, () => ({
    movePiece,
    floor,
  }));

  const smoothPos = {
    x: moveState.from.x + (moveState.to.x - moveState.from.x) * moveState.t,
    y: moveState.from.y + (moveState.to.y - moveState.from.y) * moveState.t,
  };

  return (
    <div ref={containerRef} tabIndex={0} onKeyDown={handleKeyDown} style={{ outline: "none" }} className="relative h-full w-full">
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
