import React, { useState, useEffect } from 'react';
import { useMoney } from '../contexts/MoneyContext';
import upgradesData from '../data/upgrades.json'
import oneTimeUpgradesData from '../data/oneTimeUpgrades.json';
import Upgrade from './Upgrade';
import OneTimeUpgrade from './OneTimeUpgrade';

export default function UpgradeShop() {
    const { level, xp, xpProgress } = useMoney();
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
            <div className="glass-dark rounded-2xl p-6 border border-white/10">
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
                    <span className="mr-3">🏪</span>
                    Upgrade Store
                </h2>
                <p className="text-white/60">Enhance your typing capabilities</p>
            </div>

            {/* Level System Overview */}
            <div className="space-y-6">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">⭐</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Level System</h3>
                </div>
                
                <div className="glass-dark rounded-2xl p-6 border border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Current Level Status */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-white flex items-center">
                                <span className="mr-2">🎯</span>
                                Current Progress
                            </h4>
                            <div className="bg-white/5 rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-white/70">Level</span>
                                    <span className="text-yellow-400 font-bold">{level}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-white/70">Total XP</span>
                                    <span className="text-cyan-400 font-bold">{xp}</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/60">Next Level Progress</span>
                                        <span className="text-white/60">{Math.round(xpProgress)}%</span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-2">
                                        <div 
                                            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${xpProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* XP Bonuses Guide */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-white flex items-center">
                                <span className="mr-2">🚀</span>
                                XP Bonus System
                            </h4>
                            <div className="space-y-2">
                                <div className="bg-white/5 rounded-lg p-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70 text-sm">Base XP</span>
                                        <span className="text-blue-400 font-semibold">2 XP per character</span>
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70 text-sm">Gold Words</span>
                                        <span className="text-yellow-400 font-semibold">2x XP Multiplier</span>
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70 text-sm">Streak Bonus</span>
                                        <span className="text-green-400 font-semibold">1.0x - 3.0x XP</span>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg p-3 border border-cyan-500/20">
                                    <div className="text-xs text-cyan-400 font-semibold">
                                        💡 Tip: Maintain long streaks for maximum XP gains!
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Regular Upgrades */}
            <div className="space-y-6">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">⚡</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Power Upgrades</h3>
                </div>
                
                <div className="glass-dark rounded-2xl p-6 border border-white/10">
                    <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                        {upgrades.length > 0 ? upgrades.map((upgrade) => (
                            <Upgrade
                                key={upgrade.id}
                                upgradeData={upgrade}
                            />
                        )) : (
                            <div className="text-center py-8 text-white/60">
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
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">💎</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Special Unlocks</h3>
                </div>
                
                <div className="glass-dark rounded-2xl p-6 border border-white/10">
                    <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                        {oneTimeUpgrades.length > 0 ? oneTimeUpgrades.map((upgrade) => (
                            <OneTimeUpgrade
                                key={upgrade.id}
                                upgradeData={upgrade}
                            />
                        )) : (
                            <div className="text-center py-8 text-white/60">
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