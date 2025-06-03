import React, { useState, useEffect } from 'react';
import upgradesData from '../data/upgrades.json'
import Upgrade from './Upgrade';

export default function UpgradeShop() {
    const [upgrades, setUpgrades] = useState([]);

    useEffect(() => {
        const fetchUpgrades = async () => {
            try {
                setUpgrades(upgradesData.data);
            } catch (error) {
                console.error("Error fetching upgrades:", error);
            }
        }
        fetchUpgrades();
    }, []);

    return (
        <div className="bg-white w-[calc(15%)] p-4 rounded shadow-lg overflow-scroll">
            <h2 className="text-2xl mb-4">Upgrade Shop</h2>
            <div className="flex flex-col gap-4">
                { upgrades.map((upgrade) => (
                    <Upgrade key={upgrade.id} upgradeData={upgrade} />
                ))}
            </div>
        </div>
    )
}