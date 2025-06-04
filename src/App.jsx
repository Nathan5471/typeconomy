import './App.css'
import React from 'react'
import UpgradeShop from './components/UpgradeShop'
import Word from './components/Word'

function App() {
  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="flex flex-row justify-between h-[calc(10%)] p-1 w-screen bg-green-500 text-white">
        <h1 className="text-4xl">Typeconomy</h1>
        <p className="text-4xl">Cash: $10000234</p>
      </div>
      <div className="h-[calc(90%)] w-screen bg-gray-200 flex flex-row">
        <UpgradeShop />
        <div className="bg-white w-[calc(70%)] p-4 m-4 rounded shadow-lg">
          <h2 className="text-2xl mb-4">Game Area</h2>
          <Word />
        </div>
        <div className="bg-white w-[calc(15%)] p-4 rounded shadow-lg">
          <h2 className="text-2xl mb-4">Stats</h2>
          <p className="text-lg">Player Stats will be displayed here.</p>
        </div>
      </div>
    </div>
  )
}

export default App
