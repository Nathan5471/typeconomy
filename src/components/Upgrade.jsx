import React from 'react';

export default function Upgrade({ upgradeData }) {
    const { id, name, descrition, baseCost, costMultiplier} = upgradeData;

    return (
        <div className="outline p-4 rounded shadow-lg">
            <h3 className="text-lg">{name}</h3>
            <p className="text-sm text-gray-600">{descrition}</p>
            <p className="text-sm text-gray-500">Cost: ${baseCost}</p>
        </div>
    )
}