import React, { useState, useEffect } from 'react';
import { useMoney } from '../contexts/MoneyContext';
import { getAmountOfUpgrades } from '../utils/EffectsHandler.js';
import { calculateUpgradeCost, buyUpgrade } from '../utils/UpgradeHandler.js';
import FormatMoney from '../utils/FormatMoney.js';

export default function Upgrade({ upgradeData }) {
    const { money, decreaseMoneyBy } = useMoney();
    const { id, name, description, baseCost, costMultiplier} = upgradeData;
    const [purchaseAmount, setPurchaseAmount] = useState(1);
    const [amountToPurchase, setAmountToPurchase] = useState(1);
    const [cost, setCost] = useState(baseCost);
    const [isAffordable, setIsAffordable] = useState(true);
    const [amountOfUpgrades, setAmountOfUpgrades] = useState(getAmountOfUpgrades(id));

    useEffect(() => {
        const getCost = async () => {
            const [calculatedCost, amountToPurchase] = calculateUpgradeCost(baseCost, costMultiplier, id, purchaseAmount, money);
            setCost(calculatedCost);
            setAmountToPurchase(amountToPurchase);
        }
        getCost();
    }, [baseCost, costMultiplier, id, purchaseAmount, money]);

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
        <div className="glass rounded-xl p-4 transition-all duration-300 group" 
             style={{ 
                 background: 'var(--glass-bg)', 
                 borderColor: 'var(--border-primary)' 
             }}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold transition-colors" 
                        style={{ color: 'var(--text-primary)' }}>
                        {name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Owned:</span>
                        <span className="px-2 py-1 text-sm font-medium rounded-full" 
                              style={{ 
                                  backgroundColor: 'var(--accent-blue)', 
                                  color: 'white',
                                  opacity: '0.8'
                              }}>
                            {amountOfUpgrades}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                        {FormatMoney(Number(cost))}
                    </div>
                    {amountToPurchase > 1 && (
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            ({amountToPurchase}x)
                        </div>
                    )}
                </div>
            </div>

            {/* Purchase Amount Selector */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Amount:</span>
                <div className="flex space-x-1">
                    {[1, 10, 100, 'max'].map((amount) => (
                        <button
                            key={amount}
                            className={`px-3 py-1 text-sm rounded-lg transition-all duration-200 ${
                                purchaseAmount === amount
                                    ? 'text-white shadow-lg gradient-bg'
                                    : 'hover:opacity-80'
                            }`}
                            style={{
                                backgroundColor: purchaseAmount === amount ? undefined : 'var(--glass-bg)',
                                color: purchaseAmount === amount ? undefined : 'var(--text-secondary)',
                                borderColor: 'var(--border-primary)'
                            }}
                            onClick={(e) => handlePurchaseAmountChange(e, amount)}
                        >
                            {amount}
                        </button>
                    ))}
                </div>
            </div>

            {/* Purchase Button */}
            <button 
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                    isAffordable
                        ? 'text-white shadow-lg hover:shadow-xl gradient-bg'
                        : 'cursor-not-allowed'
                }`}
                style={{
                    backgroundColor: !isAffordable ? 'var(--bg-tertiary)' : undefined,
                    color: !isAffordable ? 'var(--text-muted)' : undefined
                }}
                onClick={handleUpgradePurhcase}
                disabled={!isAffordable}
            >
                {isAffordable ? 'Purchase' : 'Insufficient Funds'}
            </button>

            {/* Tooltip */}
            <div className="absolute bottom-full left-0 right-0 mb-2 px-3 py-2 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" 
                 style={{ 
                     background: 'var(--bg-overlay)', 
                     color: 'var(--text-primary)',
                     backdropFilter: 'blur(10px)'
                 }}>
                {description}
            </div>
        </div>
    )
}