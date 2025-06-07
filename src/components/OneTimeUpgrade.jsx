import React, { useState, useEffect } from 'react';
import { useMoney } from '../contexts/MoneyContext';
import FormatMoney from '../utils/FormatMoney.js';
import { buyOneTimeUpgrade } from '../utils/UpgradeHandler.js';

export default function OneTimeUpgrade({ upgradeData }) {
    const { money, decreaseMoneyBy } = useMoney();
    const { id, name, description, cost } = upgradeData;
    const [isAffordable, setIsAffordable] = useState(false);

    useEffect(() => {
        const checkAffordability = () => {
            const affordable = money >= cost;
            setIsAffordable(affordable);
        }
        checkAffordability();
    }, [money, cost]);

    const handleUpgradePurchase = () => {
        if (isAffordable) {
            buyOneTimeUpgrade(id, cost, money);
            decreaseMoneyBy(cost);
        }
    }

    return (
        <div className="bg-[#003c18] relative group p-4 rounded shadow-lg">
            <h3 className="text-lg">{name}</h3>
            <button
                className={`mt-2 px-4 py-2 w-full rounded ${isAffordable ? 'bg-[#005e2a] text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                onClick={handleUpgradePurchase}
                disabled={money < cost}
            >
                {FormatMoney(cost)}
            </button>
            <div className="absolte bottom-full hidden group-hover:flex bg-[#005828] text-white text-sm p-2 rounded shadow-lg mt-2">
                {description}
            </div>
        </div>
    )
}