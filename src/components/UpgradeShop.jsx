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
        <div className="h-[calc(100vh-2rem)]">
            <div className="bg-[#005828] w-full h-[calc(7%)] text-white mx-4 my-2 rounded shadow-lg">
                <h1 className="text-center text-xl">Upgrade Shop</h1>
            </div>
            <div className="bg-[#005828] w-full h-[calc(40%)] text-white p-4 mx-4 my-2 rounded shadow-lg flex flex-col gap-4 overflow-y-scroll">
                {upgrades.map((upgrade) => (
                    <Upgrade
                        key={upgrade.id}
                        upgradeData={upgrade}
                    />
                ))}
            </div>
            <div className="bg-[#005828] w-full h-[calc(7%)] text-white mx-4 my-2 rounded shadow-lg">
                <h1 className="text-center text-xl">One-Time Upgrades</h1>
            </div>
            <div className="bg-[#005828] w-full h-[calc(40%)] text-white p-4 mx-4 my-2 rounded shadow-lg flex flex-col gap-4 overflow-y-scroll">
                {oneTimeUpgrades.map((upgrade) => (
                    <OneTimeUpgrade
                        key={upgrade.id}
                        upgradeData={upgrade}
                    />
                ))}
            </div>
        </div>
    )
}