import { useEffect, useRef, useState } from "react";
import { GameController } from "./components/GameController";

const App = () => {
  const gameControllerRef = useRef<{
    movePiece: (dx: number, dy: number) => void;
    floor: number;
  }>(null);

  const [floor, setFloor] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const floorValue = gameControllerRef.current?.floor ?? 0;
      setFloor(floorValue);
    }, 200);

    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex h-screen w-screen">
      <div className="basis-1/4 flex-none bg-red-200">
        <p>Floor: {floor} </p>
      </div>

      <div className="basis-1/2 flex-none flex items-center justify-center bg-gray-900">
        <GameController ref={gameControllerRef} />
      </div>

      <div className="basis-1/4 flex flex-col items-center relative bg-blue-200">
        <div>
          <p>GOLD: 999999</p>
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 ">
          <button
            onClick={() => gameControllerRef.current?.movePiece(0, -1)}
            className="w-10 h-10 rounded-md bg-gray-500 hover:bg-gray-600 text-white font-bold shadow-md
            active:scale-95 transition-all"
          >
            ^
          </button>

          <div className="flex gap-12">
            <button
              onClick={() => gameControllerRef.current?.movePiece(-1, 0)}
              className="w-10 h-10 rounded-md bg-gray-500 hover:bg-gray-600 text-white font-bold shadow-md
            active:scale-95 transition-all"
            >
              <h1>{`<`}</h1>
            </button>

            <button
              onClick={() => gameControllerRef.current?.movePiece(1, 0)}
              className="w-10 h-10 rounded-md bg-gray-500 hover:bg-gray-600 text-white font-bold shadow-md
            active:scale-95 transition-all"
            >
              <h1>{`>`}</h1>
            </button>
          </div>

          <button
            onClick={() => gameControllerRef.current?.movePiece(0, 1)}
            className="w-10 h-10 rounded-md bg-gray-500 hover:bg-gray-600 text-white font-bold shadow-md
              active:scale-95 transition-all"
          >
            v
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
