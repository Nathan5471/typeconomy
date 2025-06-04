import React, { useState, useEffect } from 'react';
import { calculateUpgradeCost } from '../utils/UpgradeHandler';

export default function Upgrade({ upgradeData }) {
    const { id, name, descrition, baseCost, costMultiplier} = upgradeData;
    const [cost, setCost] = useState(baseCost);

    useEffect(() => {
        const getCost = async () => {
            const calculatedCost = calculateUpgradeCost(baseCost, costMultiplier, id);
            setCost(calculatedCost);
        }
        getCost();
    }, [baseCost, costMultiplier, id]);

    return (
        <div className="outline p-4 rounded shadow-lg">
            <h3 className="text-lg">{name}</h3>
            <p className="text-sm text-gray-600">{descrition}</p>
            <p className="text-sm text-gray-500">Cost: ${cost}</p>
        </div>
    )
}