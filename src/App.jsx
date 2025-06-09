import './App.css'
import React from 'react'
import UpgradeShop from './components/UpgradeShop'
import GameArea from './components/GameArea'
import Stats from './components/Stats'
import Overlay from './components/Overlay'

function App() {
  return (
    <>
      <div className="w-screen h-screen flex flex-row bg-[#003916]">
        <div className="w-[calc(20%)] h-screen p-4">
          <UpgradeShop />
        </div>
        <div className="w-[calc(65%)] h-screen p-4">
          <GameArea />
        </div>
        <div className="w-[calc(15%)] h-screen p-4">
          <Stats />
        </div>
      </div>
      <Overlay />
    </>
    
  )
}

export default App
