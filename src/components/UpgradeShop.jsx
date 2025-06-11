import React, { useState, useEffect } from 'react';
import upgradesData from '../data/upgrades.json'
import oneTimeUpgradesData from '../data/oneTimeUpgrades.json';
import Upgrade from './Upgrade';
import OneTimeUpgrade from './OneTimeUpgrade';

export default function UpgradeShop() {
    const [upgrades, setUpgrades] = useState([]);
    const [oneTimeUpgrades, setOneTimeUpgrades] = useState([]);

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