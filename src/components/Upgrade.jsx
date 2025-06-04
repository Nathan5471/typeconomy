import React, { useState, useEffect } from 'react';
import { useMoney } from '../contexts/MoneyContext';
import { calculateUpgradeCost, buyUpgrade } from '../utils/UpgradeHandler';

export default function Upgrade({ upgradeData }) {
    const { money, decreaseMoneyBy } = useMoney();
    const { id, name, descrition, baseCost, costMultiplier} = upgradeData;
    const [cost, setCost] = useState(baseCost);
    const [isAffordable, setIsAffordable] = useState(true);

    useEffect(() => {
        const getCost = async () => {
            const calculatedCost = calculateUpgradeCost(baseCost, costMultiplier, id);
            setCost(calculatedCost);
        }
        getCost();
    }, [baseCost, costMultiplier, id]);

    useEffect(() => {
        const checkAffordability = () => {
            const affordable = money >= cost;
            setIsAffordable(affordable);
        }
        checkAffordability();
    }, [money, cost]);

    const handleUpgradePurhcase = () => {
        if (isAffordable) {
            const cost = buyUpgrade(id, baseCost, costMultiplier, money);
            decreaseMoneyBy(cost);
            const newCost = calculateUpgradeCost(baseCost, costMultiplier, id);
            setCost(newCost);
        }
    }

    return (
        <div className="outline p-4 rounded shadow-lg">
            <h3 className="text-lg">{name}</h3>
            <p className="text-sm text-gray-600">{descrition}</p>
            <p className="text-sm text-gray-500">Cost: ${cost}</p>
            <button 
                className={`mt-2 px-4 py-2 rounded ${isAffordable ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                onClick={() => {
                    handleUpgradePurhcase();
                }}
                disabled={!isAffordable}
            >
                {isAffordable ? 'Buy Upgrade' : 'Not Enough Money'}
            </button>
        </div>
    )
}