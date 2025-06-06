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
        <div className="bg-[#005828] text-white text-center w-full h-[calc(100vh-3rem)] p-4 mt-4 rounded shadow-lg">
            <h2 className="text-3xl">Stats</h2>
            <hr className="mb-2"/>
            <h3 className="text-2xl">Words Typed</h3>
            <p className="text-xl">{wordsTyped}</p>
            <h3 className="text-2xl mt-2">Word Multiplier</h3>
            <p className="text-xl">{wordMultiplier}x</p>
            <h3 className="text-2xl mt-2">Average Word Length</h3>
            <p className="text-xl">{averageLength} characters</p>
            <h3 className="text-2xl mt-2">Cash Per Second</h3>
            <p className="text-xl">${cashPerSecond.toFixed(2)}</p>
        </div>
    )
}