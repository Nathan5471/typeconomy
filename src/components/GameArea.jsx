import React, { useEffect, useState } from 'react';
import { useMoney } from '../contexts/MoneyContext';
import Word from './Word';

export default function GameArea() {
    const { streak, incrementWordsTyped, increaseStreak, resetStreak } = useMoney();

    function handleWordCheck (isCorrect, word) {
        if (isCorrect) {
            incrementWordsTyped(word);
            increaseStreak();
        } else {
            resetStreak();
        }
    }

    return (
        <div className="bg-white w-[calc(70%)] p-4 m-4 rounded shadow-lg">
            <h2 className="text-2xl mb-4">Game Area</h2>
            <p className="text-lg mb-4">Current Streak: {streak}</p>
            <Word handleWordCheck={handleWordCheck} />
        </div>
    );
}