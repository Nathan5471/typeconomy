import React, { useState, useEffect } from 'react';
import { useMoney } from '../contexts/MoneyContext';
import { getWordMultiplier, getAverageLength, getTotalCashPerSecond } from '../utils/StorageHandler';

export default function Stats() {
    const { wordsTyped } = useMoney();
    const [ wordMultiplier, setWordMultiplier ] = useState(1);
    const [ averageLength, setAverageLength ] = useState(3);
    const [ cashPerSecond, setCashPerSecond ] = useState(0);

    useEffect(() => {
        const storedWordMultiplier = getWordMultiplier();
        const storedAverageLength = getAverageLength();
        const storedCashPerSecond = getTotalCashPerSecond();

        setWordMultiplier(storedWordMultiplier);
        setAverageLength(storedAverageLength);
        setCashPerSecond(storedCashPerSecond);
    }, [wordsTyped]);

    return (
        <div className="bg-white w-[calc(15%)] p-4 rounded shadow-lg">
            <h2 className="text-2xl mb-4">Stats</h2>
            <p className="text-lg">Words Typed: {wordsTyped}</p>
            <p className="text-lg">Word Multiplier: {wordMultiplier.toFixed(1)}</p>
            <p className="text-lg">Average Word Length: {averageLength.toFixed(1)}</p>
            <p className="text-lg">Cash Per Second: ${cashPerSecond}</p>
        </div>
    )
}