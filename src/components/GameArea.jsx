import React, { useState, useEffect, useCallback } from 'react';
import { useMoney } from '../contexts/MoneyContext';
import { getRandomWord } from '../utils/StorageHandler.js'

export default function GameArea() {
    const { money, streak, wordMultiplier, averageLength, accuracy, handleCorrectWord, handleIncorrectWord } = useMoney();
    const [currentWord, setCurrentWord] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [fetchNewWord, setFetchNewWord] = useState(true);

    useEffect(() => {
        const fetchWord = async () => {
            try {
                const word = await getRandomWord();
                setCurrentWord(word.toLowerCase());
            } catch (error) {
                console.error('Error fetching word:', error);
            }
        }
        fetchWord();
    }, [fetchNewWord]);

    const compareWords = useCallback(() => {
        if (inputValue.toLowerCase() === currentWord) {
            handleCorrectWord(currentWord);
        } else {
            handleIncorrectWord();
        }
        setFetchNewWord(prev => !prev);
        setInputValue('');
    }, [inputValue, currentWord, handleCorrectWord, handleIncorrectWord]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === ' ' || event.key === 'Enter') {
                event.preventDefault();
                compareWords();
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        }
    }, [compareWords]);

    return (
        <div className="h-[calc(100vh-3rem)] w-full">
            <div className="bg-[#005828] w-full h-[calc(13%)] text-white flex flex-row justify-between p-2 m-4 rounded shadow-lg">
                <h1 className="text-4xl">Typeconomy</h1>
                <p className="text-4xl">Money: ${money}</p>
            </div>
            <div className="flex flex-col items-center justify-center text-white w-full h-[calc(80%)] p-2 m-4">
                <h2 className="text-4xl mb-4">{currentWord}</h2>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-1/2 p-2 text-2xl rounded bg-[#003113] text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Type the word here..."
                />
                <div className="mt-4 text-2xl flex flex-row">
                    <div className="mr-4 p-2 text-center">
                        <h3>Accuracy</h3>
                        <p>{accuracy}%</p>
                    </div>
                    <div className="mr-4 p-2 text-center">
                        <h3>Streak</h3>
                        <p>{streak}</p>
                    </div>
                    <div className="mr-4 p-2 text-center">
                        <h3>Multiplyer</h3>
                        <p>{wordMultiplier}x</p>
                    </div>
                    <div className="p-2 text-center">
                        <h3>Average Length</h3>
                        <p>{averageLength}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}