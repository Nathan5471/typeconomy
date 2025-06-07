import React from 'react';
import { useMoney } from '../contexts/MoneyContext';
import FormatMoney from '../utils/FormatMoney.js';

export default function Stats() {
    const { wordsTyped, wordsTypedCorrectly, wordsTypedIncorrectly, highestStreak, cashPerSecond } = useMoney();

    return (
        <div className="bg-[#005828] text-white text-center w-full h-[calc(100vh-3rem)] p-4 mt-4 rounded shadow-lg">
            <h2 className="text-3xl">Stats</h2>
            <hr className="mb-2"/>
            <h3 className="text-xl">Words Typed</h3>
            <p className="text-lg">{wordsTyped}</p>
            <h3 className="text-xl mt-2">Correct Words</h3>
            <p className="text-lg">{wordsTypedCorrectly}</p>
            <h3 className="text-xl mt-2">Incorrect Words</h3>
            <p className="text-lg">{wordsTypedIncorrectly}</p>
            <h3 className="text-xl mt-2">Highest Streak</h3>
            <p className="text-lg">{highestStreak}</p>
            <h3 className="text-xl mt-2">Cash Per Second</h3>
            <p className="text-lg">{FormatMoney(cashPerSecond)}</p>
        </div>
    )
}