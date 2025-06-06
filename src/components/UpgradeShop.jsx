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
        <div className="h-[calc(100vh-2rem)]">
            <div className="bg-[#005828] w-full h-[calc(13%)] text-white p-4 m-4 rounded shadow-lg">
                <h1 className="text-center text-3xl">Upgrade Shop</h1>
            </div>
            <div className="bg-[#005828] w-full h-[calc(80%)] text-white p-4 m-4 rounded shadow-lg flex flex-col gap-4 overflow-y-scroll">
                {upgrades.map((upgrade) => (
                    <Upgrade
                        key={upgrade.id}
                        upgradeData={upgrade}
                    />
                ))}
            </div>
        </div>
    )
}