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
        <div className="glass-dark rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 group relative overflow-hidden">
            {/* Premium Badge */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-bl-full"></div>
            
            <div className="relative">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white group-hover:text-green-400 transition-colors">
                            {name}
                        </h3>
                        <div className="flex items-center mt-2">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                            <span className="text-xs font-medium text-green-400 uppercase tracking-wide">
                                One-Time Unlock
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-bold text-white">
                            {FormatMoney(cost)}
                        </div>
                        <div className="text-xs text-white/60">
                            Forever
                        </div>
                    </div>
                </div>

                <p className="text-white/70 text-sm mb-4 leading-relaxed">
                    {description}
                </p>

                <button
                    className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                        isAffordable
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
                            : 'bg-white/10 text-white/50 cursor-not-allowed'
                    }`}
                    onClick={handleUpgradePurchase}
                    disabled={!isAffordable}
                >
                    {isAffordable ? 'Unlock Forever' : 'Insufficient Funds'}
                </button>
            </div>
        </div>
    )
}