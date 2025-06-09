import React, { useState, useEffect, useCallback } from 'react';
import { useMoney } from '../contexts/MoneyContext';
import { getRandomWord } from '../utils/StorageHandler.js'
import { getIsGoldWord } from '../utils/EffectsHandler.js';
import FormatMoney from '../utils/FormatMoney.js';

export default function GameArea() {
    const { money, streak, wordMultiplier, averageLength, accuracy, unlockedFeatures, handleCorrectWord, handleIncorrectWord } = useMoney();
    const [words, setWords] = useState([]); // Used to store 5 words (next2, next2, current, last1, last2)
    const [inputValue, setInputValue] = useState('');
    const [fetchNewWord, setFetchNewWord] = useState(true);
    const [isGold, setIsGold] = useState(false);

    useEffect(() => {
        const fetchNewWords = async () => {
            const word1 = await getRandomWord();
            const word2 = await getRandomWord();
            const word3 = await getRandomWord();
            setWords([word1.toLowerCase(), word2.toLowerCase(), word3.toLowerCase()]);
        }
        fetchNewWords();
    }, []);

    useEffect(() => {
        const fetchNextWord = async () => {
            const newWord = await getRandomWord();
            setWords(prevWords => [newWord.toLowerCase(), ...prevWords.slice(0, 4)]);
        }
        fetchNextWord();
    }, [fetchNewWord]);

    const compareWords = useCallback(() => {
        if (inputValue.toLowerCase() === words[2]) {
            handleCorrectWord(words[2], isGold);
        } else {
            handleIncorrectWord();
        }
        setIsGold(getIsGoldWord());
        setFetchNewWord(prev => !prev);
        setInputValue('');
    }, [inputValue, words, handleCorrectWord, handleIncorrectWord, isGold]);

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
                <p className="text-4xl">Money: {FormatMoney(money)}</p>
            </div>
            <div className="flex flex-col items-center justify-center text-white w-full h-[calc(60%)] p-2 m-4">
                <div className="grid grid-cols-5 text-center items-center justify-center w-full mb-3">
                    <p className="text-xl text-white/33">{words[4]}</p>
                    <p className="text-xl text-white/66 ml-3">{words[3]}</p>
                    <h2 className={`text-2xl ${isGold === true ? "bg-yellow-400/20 text-yellow-400 rounded" : "text-white"}`}>{words[2]}</h2>
                    <p className="text-xl text-white/66 ml-3">{words[1]}</p>
                    <p className="text-xl text-white/33 ml-3">{words[0]}</p>
                </div>
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
            <div className="mt-4 flex flex-row items-center justify-center text-white text-2xl">
                <button className={`m-2 ${unlockedFeatures.has('typingTest') ? 'bg-[#005828]' : 'disabled cursor-not-allowed bg-gray-300 text-gray-500'} p-2 rounded-lg shadow-lg`}>Typing Test</button>
                <button className={`m-2 ${unlockedFeatures.has('difficulty') ? 'bg-[#005828]' : 'disabled cursor-not-allowed bg-gray-300 text-gray-500'} p-2 rounded-lg shadow-lg`}>Difficulty</button>
                <button className={`m-2 bg-[#005828] p-2 rounded-lg shadow-lg`}>Other</button>
                <button className={`m-2 bg-[#005828] p-2 rounded-lg shadow-lg`}>Import/Export</button>
            </div>
        </div>
    );
}