import React, { useState, useEffect } from 'react';
import { useMoney } from '../contexts/MoneyContext';
import FormatMoney from '../utils/FormatMoney.js';
import { buyOneTimeUpgrade } from '../utils/UpgradeHandler.js';

export default function OneTimeUpgrade({ upgradeData }) {
    const { money, decreaseMoneyBy, purchasedOneTimeUpgrades, purchasedOneTimeUpgrade, handleUnlockFeature } = useMoney();
    const { id, name, description, cost, feature } = upgradeData;
    const [isAffordable, setIsAffordable] = useState(false);
    const [isPurchased, setIsPurchased] = useState(false);

    useEffect(() => {
        const checkAffordability = () => {
            const affordable = money >= cost;
            setIsAffordable(affordable);
        }
        checkAffordability();
    }, [money, cost]);

    const handleUpgradePurchase = () => {
        if (isAffordable && feature === 'none') {
            buyOneTimeUpgrade(id, cost, money);
            decreaseMoneyBy(cost);
            purchasedOneTimeUpgrade(id);
            setIsPurchased(true);
        } else if (isAffordable && feature !== 'none') {
            handleUnlockFeature(feature);
            decreaseMoneyBy(cost);
            purchasedOneTimeUpgrade(id);
            setIsPurchased(true);
        } else {
            console.warn(`Upgrade ${name} is not affordable. Current money: ${money}, Upgrade cost: ${cost}`);
        }
    }

    useEffect(() => {
        const purchased = purchasedOneTimeUpgrades.has(id);
        setIsPurchased(purchased);
    }, [id, purchasedOneTimeUpgrades]);

    if (isPurchased) {
        return (
            null
        )
    }

    return (
        <div className="glass rounded-xl p-4 transition-all duration-300 group relative overflow-hidden" 
             style={{ 
                 background: 'var(--glass-bg)', 
                 borderColor: 'var(--border-primary)' 
             }}>
            {/* Premium Badge */}
            <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full gradient-bg-alt" 
                 style={{ opacity: '0.2' }}></div>
            
            <div className="relative">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold transition-colors" 
                            style={{ color: 'var(--text-primary)' }}>
                            {name}
                        </h3>
                        <div className="flex items-center mt-2">
                            <span className="w-2 h-2 rounded-full mr-2 animate-pulse" 
                                  style={{ backgroundColor: 'var(--accent-green)' }}></span>
                            <span className="text-xs font-medium uppercase tracking-wide" 
                                  style={{ color: 'var(--accent-green)' }}>
                                One-Time Unlock
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                            {FormatMoney(cost)}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            Forever
                        </div>
                    </div>
                </div>

                <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {description}
                </p>

                <button
                    className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                        isAffordable
                            ? 'text-white shadow-lg hover:shadow-xl gradient-bg-alt'
                            : 'cursor-not-allowed'
                    }`}
                    style={{
                        backgroundColor: !isAffordable ? 'var(--bg-tertiary)' : undefined,
                        color: !isAffordable ? 'var(--text-muted)' : undefined
                    }}
                    onClick={handleUpgradePurchase}
                    disabled={!isAffordable}
                >
                    {isAffordable ? 'Unlock Forever' : 'Insufficient Funds'}
                </button>
            </div>
        </div>
    )
}