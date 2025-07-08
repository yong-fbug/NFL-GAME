
import { GameController } from "./components/GameController"


const App = () => {
  return (
    <div className='min-h-screen bg-black p-8 overflow-hidden flex items-center justify-center'>
      <div className='absolute left-30 top-20'>
        <h1 className='text-xl mb-4 text-white'>Night Fall Loop</h1>
      </div>    
        <GameController />
    </div>
  )
}

export default App