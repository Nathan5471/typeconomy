import React, { useState } from 'react'
import UpgradeShop from './components/UpgradeShop'
import GameArea from './components/GameArea'
import Stats from './components/Stats'
import Overlay from './components/Overlay'
import ThemeToggle from './components/ThemeToggle'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  const [activeTab, setActiveTab] = useState('typing');

  const navigation = [
    { id: 'typing', label: 'Typing' },
    { id: 'upgrades', label: 'Store' },
    { id: 'stats', label: 'Stats' },
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
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 transition-colors duration-500"
           style={{
             background: 'var(--bg-primary)',
             backgroundImage: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-tertiary) 100%)'
           }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        {/* Header */}
        <header className="relative z-10 glass-dark border-b border-white/10"
                style={{ background: 'var(--glass-bg)', borderColor: 'var(--border-primary)' }}>
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-glow">
                  <span className="text-white font-bold text-xl">T</span>
                </div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Type<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">conomy</span>
                </h1>
              </div>
              
              <div className="flex items-center space-x-6">
                {/* Theme Toggle */}
                <ThemeToggle />
                
                {/* Navigation */}
                <nav className="flex space-x-1 bg-white/5 rounded-xl p-1 backdrop-blur-sm"
                     style={{ background: 'var(--glass-bg)' }}>
                  {navigation.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'bg-white/20 shadow-lg'
                          : 'hover:bg-white/10'
                      }`}
                      style={{
                        color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                        backgroundColor: activeTab === tab.id ? 'var(--glass-border)' : 'transparent'
                      }}
                    >
                      <span className="text-lg">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
          <div className="glass rounded-2xl min-h-[calc(100vh-200px)] p-8 shadow-2xl"
               style={{ 
                 background: 'var(--glass-bg)',
                 borderColor: 'var(--border-primary)',
                 boxShadow: `0 25px 50px -12px var(--shadow-color)`
               }}>
            {renderContent()}
          </div>
        </main>
      </div>
      <Overlay />
    </ThemeProvider>
  )
}

export default App
