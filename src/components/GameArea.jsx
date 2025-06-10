import React, { useState, useEffect, useCallback } from 'react';
import { useMoney } from '../contexts/MoneyContext';
import { useOverlayContext } from '../contexts/OverlayContext';
import { getRandomWord } from '../utils/StorageHandler.js'
import { getIsGoldWord } from '../utils/EffectsHandler.js';
import FormatMoney from '../utils/FormatMoney.js';
import DifficultyFormat from '../utils/DifficultFormat.js';
import TypingTest from './TypingTest.jsx';
import Difficulty from './Difficulty.jsx';
import ImportExport from './ImportExport.jsx';

export default function GameArea() {
    const { money, streak, wordMultiplier, averageLength, accuracy, unlockedFeatures, typingTestBoostActive, lastTypingTestTime, handleCorrectWord, handleIncorrectWord } = useMoney();
    const { openOverlay } = useOverlayContext();
    const [words, setWords] = useState([]); // Used to store 5 words (next2, next2, current, last1, last2)
    const [inputValue, setInputValue] = useState('');
    const [fetchNewWord, setFetchNewWord] = useState(true);
    const [isGold, setIsGold] = useState(false);
    const [isTypingTestOpen, setIsTypingTestOpen] = useState(false);
    const [typingTestCountdown, setTypingTestCountdown] = useState(null);

    useEffect(() => {
        const fetchNewWords = async () => {
            const word1 = await getRandomWord();
            const word2 = await getRandomWord();
            const word3 = await getRandomWord();
            setWords([DifficultyFormat(word1), DifficultyFormat(word2), DifficultyFormat(word3)]);
        }
        fetchNewWords();
    }, []);

    useEffect(() => {
        const fetchNextWord = async () => {
            const newWord = await getRandomWord();
            setWords(prevWords => [DifficultyFormat(newWord), ...prevWords.slice(0, 4)]);
        }
        fetchNextWord();
    }, [fetchNewWord]);

    const compareWords = useCallback(() => {
        if (inputValue === words[2]) {
            handleCorrectWord(words[2], isGold);
        } else {
            handleIncorrectWord();
        }
        setIsGold(getIsGoldWord());
        setFetchNewWord(prev => !prev);
        setInputValue('');
    }, [inputValue, words, handleCorrectWord, handleIncorrectWord, isGold]);

    useEffect(() => {
        if (isTypingTestOpen) return; // Prevent keydown events when typing test is open
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
    }, [compareWords, isTypingTestOpen]);

    const handleTypingTest = (e) => {
        e.preventDefault();
        setIsTypingTestOpen(true);
        openOverlay(<TypingTest closeTypingTest={() => {setIsTypingTestOpen(false)}}/>);
    }

    const handleDifficulty = (e) => {
        e.preventDefault();
        openOverlay(<Difficulty />);
    }

    const handleImportExport = (e) => {
        e.preventDefault();
        openOverlay(<ImportExport />);
    }

    const handleCountdown = (startTime, duration ) => { // Duration in milliseconds
        const endTime = new Date(startTime.getTime() + duration);
        const interval = setInterval(() => {
            const now = new Date();
            const remainingTime = Math.max(0, endTime - now);
            if (remainingTime <= 0) {
                clearInterval(interval);
                setTypingTestCountdown(null);
                return;
            }
            const totalSeconds = Math.floor(remainingTime / 1000);
            setTypingTestCountdown(totalSeconds);
        }, 1000);
        return () => clearInterval(interval);
    }

    useEffect(() => {
        if (lastTypingTestTime === null) {
            setTypingTestCountdown(null);
            return;
        }
        if (typingTestBoostActive === true) {
            handleCountdown(lastTypingTestTime, 60000); // 60 seconds countdown
        } else if (typingTestBoostActive === false && new Date(lastTypingTestTime.getTime() + 60000) < new Date() && new Date(lastTypingTestTime.getTime() + 60000 * 11) > new Date()) {
            handleCountdown(new Date(lastTypingTestTime.getTime() + 60000), (60000 * 10)); // 10 minutes cooldown after typing test
        } else {
            setTypingTestCountdown(null);
        }
    }, [typingTestBoostActive, lastTypingTestTime]);

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
                { lastTypingTestTime !== null && new Date(lastTypingTestTime.getTime() + 60000 * 11) > Date.now() ?
                <button className={`m-2 ${typingTestBoostActive === true ? 'bg-[#005828]' : 'bg-gray-300 text-gray-500'} p-2 rounded-lg shadow-lg`}>{typingTestCountdown}</button> :
                <button className={`m-2 ${unlockedFeatures.has('typingTest') ? 'bg-[#005828]' : 'disabled cursor-not-allowed bg-gray-300 text-gray-500'} p-2 rounded-lg shadow-lg`} onClick={handleTypingTest}>Typing Test</button>
                }
                
                <button className={`m-2 ${unlockedFeatures.has('difficulty') ? 'bg-[#005828]' : 'disabled cursor-not-allowed bg-gray-300 text-gray-500'} p-2 rounded-lg shadow-lg`} onClick={handleDifficulty}>Difficulty</button>
                <button className={`m-2 bg-[#005828] p-2 rounded-lg shadow-lg`} onClick={handleImportExport}>Import/Export</button>
            </div>
        </div>
    );
}