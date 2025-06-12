import React, { useState, useEffect } from 'react';
import { useMoney } from '../contexts/MoneyContext';
import upgradesData from '../data/upgrades.json'
import oneTimeUpgradesData from '../data/oneTimeUpgrades.json';
import Upgrade from './Upgrade';
import OneTimeUpgrade from './OneTimeUpgrade';
import FormatMoney from '../utils/FormatMoney.js';

export default function UpgradeShop() {
    const { money, xp, level, cashPerSecond } = useMoney();
    const [upgrades, setUpgrades] = useState([]);
    const [oneTimeUpgrades, setOneTimeUpgrades] = useState([]);

    // ...existing code...

    useEffect(() => {
        const fetchUpgrades = async () => {
            try {
                setUpgrades(upgradesData.data);
                setOneTimeUpgrades(oneTimeUpgradesData.data);
            } catch (error) {
                console.error("Error fetching upgrades:", error);
            }
        }
        fetchUpgrades();
    }, []);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="glass rounded-2xl p-6" 
                 style={{ 
                     background: 'var(--glass-bg)', 
                     borderColor: 'var(--border-primary)' 
                 }}>
                <h2 className="text-3xl font-bold mb-2 flex items-center" 
                    style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-3">🏪</span>
                    Upgrade Store
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>Enhance your typing capabilities</p>
            </div>

            {/* Balance Display */}
            <div className="glass rounded-2xl p-6" 
                 style={{ 
                     background: 'var(--glass-bg)', 
                     borderColor: 'var(--border-primary)' 
                 }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                        <div className="text-center">
                            <div className="text-3xl font-bold flex items-center justify-center" 
                                 style={{ color: 'var(--text-primary)' }}>
                                <span className="mr-2">💰</span>
                                <span style={{ color: 'var(--accent-green)' }}>{FormatMoney(money)}</span>
                            </div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Your Balance</div>
                        </div>
                        <div className="w-px h-12" style={{ backgroundColor: 'var(--border-primary)' }}></div>
                        <div className="text-center">
                            <div className="text-2xl font-bold" style={{ color: 'var(--accent-cyan)' }}>{xp} XP</div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Experience</div>
                        </div>
                        <div className="w-px h-12" style={{ backgroundColor: 'var(--border-primary)' }}></div>
                        <div className="text-center">
                            <div className="text-2xl font-bold" style={{ color: 'var(--accent-yellow)' }}>Level {level}</div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Current Level</div>
                        </div>
                        {cashPerSecond > 0 && (
                            <>
                                <div className="w-px h-12" style={{ backgroundColor: 'var(--border-primary)' }}></div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold flex items-center justify-center" 
                                         style={{ color: 'var(--accent-emerald)' }}>
                                        <span className="mr-1">💸</span>
                                        <span>{FormatMoney(cashPerSecond)}</span>
                                    </div>
                                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Per Second</div>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="text-lg" style={{ color: 'var(--text-secondary)' }}>💡 Tip</div>
                        <div className="text-sm max-w-xs" style={{ color: 'var(--text-muted)' }}>
                            Upgrades improve your typing earnings and unlock new features
                        </div>
                    </div>
                </div>
            </div>

            {/* Regular Upgrades */}
            <div className="space-y-6">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center gradient-bg">
                        <span className="text-white text-sm">⚡</span>
                    </div>
                    <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Power Upgrades</h3>
                </div>
                
                <div className="glass rounded-2xl p-6" 
                     style={{ 
                         background: 'var(--glass-bg)', 
                         borderColor: 'var(--border-primary)' 
                     }}>
                    <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                        {upgrades.length > 0 ? upgrades.map((upgrade) => (
                            <Upgrade
                                key={upgrade.id}
                                upgradeData={upgrade}
                            />
                        )) : (
                            <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                                <div className="text-4xl mb-2">📦</div>
                                <div>No upgrades available</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* One-Time Upgrades */}
            <div className="space-y-6">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center gradient-bg-alt">
                        <span className="text-white text-sm">💎</span>
                    </div>
                    <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Special Unlocks</h3>
                </div>
                
                <div className="glass rounded-2xl p-6" 
                     style={{ 
                         background: 'var(--glass-bg)', 
                         borderColor: 'var(--border-primary)' 
                     }}>
                    <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                        {oneTimeUpgrades.length > 0 ? oneTimeUpgrades.map((upgrade) => (
                            <OneTimeUpgrade
                                key={upgrade.id}
                                upgradeData={upgrade}
                            />
                        )) : (
                            <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                                <div className="text-4xl mb-2">🎁</div>
                                <div>No special upgrades available</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}