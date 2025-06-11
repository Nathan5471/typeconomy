import React, { useState } from 'react'
import UpgradeShop from './components/UpgradeShop'
import GameArea from './components/GameArea'
import Stats from './components/Stats'
import Overlay from './components/Overlay'

function App() {
  const [activeTab, setActiveTab] = useState('typing');

  const navigation = [
    { id: 'typing', label: 'Typing', icon: '⌨️' },
    { id: 'upgrades', label: 'Store', icon: '🏪' },
    { id: 'stats', label: 'Stats', icon: '📊' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'typing':
        return <GameArea />;
      case 'upgrades':
        return <UpgradeShop />;
      case 'stats':
        return <Stats />;
      default:
        return <GameArea />;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        {/* Header */}
        <header className="relative z-10 glass-dark border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-glow">
                  <span className="text-white font-bold text-xl">T</span>
                </div>
                <h1 className="text-3xl font-bold text-white">
                  Type<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">conomy</span>
                </h1>
              </div>
              
              {/* Navigation */}
              <nav className="flex space-x-1 bg-white/5 rounded-xl p-1 backdrop-blur-sm">
                {navigation.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
          <div className="glass rounded-2xl min-h-[calc(100vh-200px)] p-8 shadow-2xl">
            {renderContent()}
          </div>
        </main>
      </div>
      <Overlay />
    </>
  )
}

export default App
