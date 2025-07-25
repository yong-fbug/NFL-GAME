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
import { Piece } from "../game/entities/Piece";
import { generateBasePieceStats } from "../game/entities/PieceStats";

export const GameController = forwardRef((_, ref) => {
  const initial = React.useMemo(() => generateMap(), []);
  const [floor, setFloor] = useState(0);
  const [tileSize, setTileSize] = useState(20);
  const [{ map }, setMap] = useState(initial);
  const [mobs, setMobs] = useState(() => spawnMobs(0, 10, WIDTH, HEIGHT));
  const [moveState, setMoveState] = useState({
    from: initial.spawn,
    to: initial.spawn,
    t: 1,
  });
  const [playerPiece] = useState(() => 
    new Piece(initial.spawn.x, initial.spawn.y, generateBasePieceStats())
  );
  const [attackMode, setAttackMode] = useState<boolean>(false)

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

    const nextX = moveState.to.x + dx;
    const nextY = moveState.to.y + dy;

    const target = mobs.find(m => m.x === nextX && m.y === nextY && m.stats.health > 0);

    if (target) {
      console.log(`Bumped mob ${target.id} — attacking for ${playerPiece.stats.attack} dmg`);
      setMobs(prev =>
        prev
          .map(m =>
            m.id === target.id
              ? {
                  ...m,
                  stats: {
                    ...m.stats,
                    health: Math.max(0, m.stats.health - playerPiece.stats.attack),
                  },
                }
              : m
          )
          .filter(m => m.stats.health > 0) // Remove dead mobs
      );
      return; // block actual movement
    }

    const result = movePieceLogic({
      dx, dy, direction: dir, moveState, map, mobs, WIDTH, HEIGHT
    });
    if (!result) return;

    if (result.floorChange) {
      setMap(result.newMap!);
      setFloor(prev => {
        const newFloor = prev + result.floorChange!;
        setMobs(spawnMobs(newFloor, 10, WIDTH, HEIGHT));
        return newFloor;
      });
    }

    setMoveState(result.moveState);

    const playerPos = result.moveState.to;
    setMobs(prev => moveMobs({ mobs: prev, playerPos, map, WIDTH, HEIGHT }));
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (attackMode) {
      switch (e.key){
        case "ArrowUp": return tryAttack("up");
        case "ArrowDown": return tryAttack("down");
        case "ArrowLeft": return tryAttack("left");
        case "ArrowRight": return tryAttack("right");
        case "Shift": return setAttackMode(false);
      }
    } else {
        switch (e.key) {
        case "ArrowUp": return movePiece(0, -1, "up");
        case "ArrowDown": return movePiece(0, 1, "down");
        case "ArrowLeft": return movePiece(-1, 0, "left");
        case "ArrowRight": return movePiece(1, 0, "right");
        case " ": return movePiece(0, 0, "stay");
        case "a": return setAttackMode(true);
      }
    }
    
  };

  //Attack logic
  const tryAttack = (direction: "up" | "down" | "left" | "right" | "stay") => {
    const { x, y } = moveState.to;
    let targetTile = { x, y };

    switch(direction) {
      case "up": targetTile.y -= 1; break;
      case "down": targetTile.y += 1; break;
      case "left": targetTile.x -= 1; break;
      case "right": targetTile.x += 1; break; 
    }

    const range = playerPiece.stats.range;
    const dx = Math.abs(targetTile.x - x);
    const dy = Math.abs(targetTile.y - y);

    if (dy + dx > range) {
      console.log("Out of range") //debugging
      return;
    }

    const target = mobs.find(m => m.x === targetTile.x && m.y === targetTile.y && m.stats.health > 0);
    if (!target){
      console.log("No mob on that tile");
      return;
    }

    //
    console.log(`Attacked mob ${target.id}!`);
    setMobs(prev => 
      prev.map(m => {
        if (m.id === target.id) {
          const newHealth = Math.max(0, m.stats.health - playerPiece.stats.attack);
           console.log(`Damage mob ${m.id} → ${m.stats.health} → ${newHealth}`)
           return { ...m, stats: { ...m.stats, health: newHealth }}
        }
        return m;
      })
      .filter(m => m.stats.health > 0)
    );
    setAttackMode(false); //this cancel out the activation of attack so either comment this or make it feature
  };

  useImperativeHandle(ref, () => ({ // Expose these to App 
    movePiece,
    floor,
    stats: playerPiece.stats, 
    setAttackMode,
  }));

  const smoothPos = {
    x: moveState.from.x + (moveState.to.x - moveState.from.x) * moveState.t,
    y: moveState.from.y + (moveState.to.y - moveState.from.y) * moveState.t,
    stats: playerPiece.stats,
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
