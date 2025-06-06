import React, { useState, useEffect } from 'react';
import { useMoney } from '../contexts/MoneyContext';
import { getAmountOfUpgrades } from '../utils/StorageHandler';
import { calculateUpgradeCost, buyUpgrade } from '../utils/UpgradeHandler';

export default function Upgrade({ upgradeData }) {
    const { money, decreaseMoneyBy } = useMoney();
    const { id, name, description, baseCost, costMultiplier} = upgradeData;
    const [purchaseAmount, setPurchaseAmount] = useState(1);
    const [cost, setCost] = useState(baseCost);
    const [isAffordable, setIsAffordable] = useState(true);
    const [amountOfUpgrades, setAmountOfUpgrades] = useState(getAmountOfUpgrades(id));

    useEffect(() => {
        const getCost = async () => {
            const calculatedCost = calculateUpgradeCost(baseCost, costMultiplier, id, purchaseAmount);
            setCost(calculatedCost);
        }
        getCost();
    }, [baseCost, costMultiplier, id, purchaseAmount]);

    useEffect(() => {
        const checkAffordability = () => {
            const affordable = money >= cost;
            setIsAffordable(affordable);
        }
        checkAffordability();
    }, [money, cost]);

    const handlePurchaseAmountChange = (e, amount) => {
        e.preventDefault();
        setPurchaseAmount(amount);
    }

    const handleUpgradePurhcase = () => {
        if (isAffordable) {
            const cost = buyUpgrade(id, baseCost, costMultiplier, money, purchaseAmount);
            decreaseMoneyBy(cost);
            const newCost = calculateUpgradeCost(baseCost, costMultiplier, id, purchaseAmount);
            setCost(newCost);
            setAmountOfUpgrades(getAmountOfUpgrades(id));
        }
    }

    return (
        <div className="bg-[#003c18] relative group p-4 rounded shadow-lg">
            <h3 className="text-lg">{name} ({amountOfUpgrades})</h3>
            <div className="flex flex-row w-full justify-between items-center">
                <p className="text-white text-lg">Buy:</p>
                <button
                    className={`px-1 py-.5 text-sm rounded ${purchaseAmount === 1 ? 'bg-[#005e2a] text-white' : 'bg-gray-300 text-gray-500'}`}
                    onClick={(e) => handlePurchaseAmountChange(e, 1)}
                >
                    1
                </button>
                <button
                    className={`px-1 py-.5 text-sm rounded ${purchaseAmount === 10 ? 'bg-[#005e2a] text-white' : 'bg-gray-300 text-gray-500'}`}
                    onClick={(e) => handlePurchaseAmountChange(e, 10)}
                >
                    10
                </button>
                <button
                    className={`px-1 py-.5 text-sm rounded ${purchaseAmount === 100 ? 'bg-[#005e2a] text-white' : 'bg-gray-300 text-gray-500'}`}
                    onClick={(e) => handlePurchaseAmountChange(e, 100)}
                >
                    100
                </button>
                <button
                    className={`px-1 py-.5 text-sm rounded ${purchaseAmount === 'max' ? 'bg-[#005e2a] text-white' : 'bg-gray-300 text-gray-500'}`}
                    onClick={(e) => handlePurchaseAmountChange(e, 'max')}
                >
                    max
                </button>
            </div>
            <button 
                className={`mt-2 px-4 py-2 w-full rounded ${isAffordable ? 'bg-[#005e2a] text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                onClick={() => {
                    handleUpgradePurhcase();
                }}
                disabled={!isAffordable}
            >
                {cost}
            </button>
            <div className="absolte bottom-full hidden group-hover:flex bg-[#005828] text-white text-sm p-2 rounded shadow-lg mt-2">
                {description}
            </div>
        </div>
    )
}