import './App.css'
import React from 'react'
import { useMoney } from './contexts/MoneyContext'
import UpgradeShop from './components/UpgradeShop'
import GameArea from './components/GameArea'
import Stats from './components/Stats'

function App() {
  const { money } = useMoney()
  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="flex flex-row justify-between h-[calc(10%)] p-1 w-screen bg-green-500 text-white">
        <h1 className="text-4xl">Typeconomy</h1>
        <p className="text-4xl">Cash: {money}</p>
      </div>
      <div className="h-[calc(90%)] w-screen bg-gray-200 flex flex-row">
        <UpgradeShop />
        <GameArea />
        <Stats />
      </div>
    </div>
  )
}

export default App
