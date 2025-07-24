import { useEffect, useRef, useState } from "react";
import { GameController } from "./components/GameController";

const App = () => {
  const gameControllerRef = useRef<{
    movePiece: (
      dx: number,
      dy: number,
      direction?: "up" | "down" | "left" | "right" | "stay"
    ) => void;
    floor: number;
    stats: unknown;
    attack: (direction: "up" | "down" | "left" | "right" | "stay") => void;
    doSomething: () => void;
  }>(null);

  const [floor, setFloor] = useState(0);
  const [stats, setStats] = useState<null | Record<string, any>>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const floorValue = gameControllerRef.current?.floor ?? 0;
      const statsValue = gameControllerRef.current?.stats ?? 0;
      setFloor(floorValue);
      setStats(statsValue);
    }, 200);

    return () => clearInterval(interval);
  }, []);
console.log("Cataclysmic Anomaly System")
  return (
    <div className="flex h-[100dvh] w-screen">
      {/* LEFT INFO */}
      <div className="hidden md:flex basis-1/4 flex-none bg-red-200 p-4">
        <p>Floor: {floor} </p>
        {stats && (
          <div className="mt-4">
            <p className="font-bold text-2xl">{stats.name} </p>
            
            <p>Health: {stats.health}</p>
            <p>Mana: {stats.mana}</p>
            <p>Attack: {stats.attack}</p>
            <p>Armor: {stats.armor}</p>
          </div>
        )}
      </div>
      

      {/* CENTER MAP */}
      <div className="flex items-center justify-center bg-gray-900">
        <div className="relative flex-grow flex items-center justify-center bg-gray-900">
          <GameController ref={gameControllerRef} />
          <button
            onClick={() => gameControllerRef.current?.attack}
          >A</button>
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 z-50">
          <button
            onClick={() => gameControllerRef.current?.movePiece(0, -1, "up")}
            className="w-10 h-10 rounded-md bg-transparent border border-gray-500 hover:bg-gray-600 
            text-white font-bold shadow-md active:scale-95 transition-all"
          >
            ^
          </button>

          <div className="flex gap-2">
            <button
              onClick={() =>
                gameControllerRef.current?.movePiece(-1, 0, "left")
              }
              className="w-10 h-10 rounded-md bg-transparent border border-gray-500 hover:bg-gray-600 
              text-white font-bold shadow-md active:scale-95 transition-all"
            >
              <h1>{`<`}</h1>
            </button>

            <button
              onClick={() => gameControllerRef.current?.movePiece(0, 0, "stay")}
              className="w-10 h-10 rounded-md bg-transparent border border-gray-500 hover:bg-gray-600 
              text-white font-bold shadow-md active:scale-95 transition-all"
            >
              ⎵
            </button>

            <button
              onClick={() =>
                gameControllerRef.current?.movePiece(1, 0, "right")
              }
              className="w-10 h-10 rounded-md bg-transparent border border-gray-500 hover:bg-gray-600 
              text-white font-bold shadow-md active:scale-95 transition-all"
            >
              <h1>{`>`}</h1>
            </button>
          </div>

          <button
            onClick={() => gameControllerRef.current?.movePiece(0, 1, "down")}
            className="w-10 h-10 rounded-md bg-transparent border border-gray-500 hover:bg-gray-600 
              text-white font-bold shadow-md active:scale-95 transition-all"
          >
            v
          </button>
        </div>
      </div>

      {/* RIGHT INFO + CONTROLS */}
      <div className="hidden flex-grow md:flex basis-1/4 flex-col items-center relative bg-blue-200 p-4">
        <div>
          <p>GOLD: 999999</p>
        </div>
      </div>
    </div>
  );
};

export default App;
