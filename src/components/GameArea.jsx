import React, { useState, useEffect, useCallback } from 'react';
import { useMoney } from '../contexts/MoneyContext';
import { useOverlayContext } from '../contexts/OverlayContext';
import { getRandomWord, calculateWordXP } from '../utils/StorageHandler.js'
import { getIsGoldWord } from '../utils/EffectsHandler.js';
import FormatMoney from '../utils/FormatMoney.js';
import DifficultyFormat from '../utils/DifficultFormat.js';
import TypingTest from './TypingTest.jsx';
import Difficulty from './Difficulty.jsx';
import ImportExport from './ImportExport.jsx';

export default function GameArea() {
    const { money, streak, wordMultiplier, averageLength, accuracy, unlockedFeatures, typingTestBoostActive, lastTypingTestTime, level, xp, xpProgress, levelUpNotification, handleCorrectWord, handleIncorrectWord } = useMoney();
    const { openOverlay } = useOverlayContext();
    const [words, setWords] = useState([]); // Used to store 5 words (next2, next2, current, last1, last2)
    const [inputValue, setInputValue] = useState('');
    const [fetchNewWord, setFetchNewWord] = useState(true);
    const [isGold, setIsGold] = useState(false);
    const [isTypingTestOpen, setIsTypingTestOpen] = useState(false);
    const [typingTestCountdown, setTypingTestCountdown] = useState(null);
    const [xpGainNotification, setXPGainNotification] = useState({ show: false, amount: 0 });

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
            
            // Show XP gain notification
            const xpGained = calculateWordXP(words[2], isGold, streak + 1);
            setXPGainNotification({ show: true, amount: xpGained });
            setTimeout(() => setXPGainNotification({ show: false, amount: 0 }), 2000);
        } else {
            handleIncorrectWord();
        }
        setIsGold(getIsGoldWord());
        setFetchNewWord(prev => !prev);
        setInputValue('');
    }, [inputValue, words, handleCorrectWord, handleIncorrectWord, isGold, streak]);

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
        <div className="h-full w-full space-y-8">
            {/* Header Stats */}
            <div className="glass-dark rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">{FormatMoney(money)}</div>
                            <div className="text-sm text-white/60">Balance</div>
                        </div>
                        <div className="w-px h-12 bg-white/20"></div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-400">{streak}</div>
                            <div className="text-sm text-white/60">Streak</div>
                            {streak >= 3 && (
                                <div className="text-xs text-cyan-400 font-semibold">
                                    {streak >= 50 ? '3.0x' : 
                                     streak >= 25 ? '2.5x' : 
                                     streak >= 15 ? '2.0x' : 
                                     streak >= 10 ? '1.8x' : 
                                     streak >= 5 ? '1.5x' : '1.2x'} XP
                                </div>
                            )}
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-400">{accuracy}%</div>
                            <div className="text-sm text-white/60">Accuracy</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-400">{wordMultiplier}x</div>
                            <div className="text-sm text-white/60">Multiplier</div>
                        </div>
                    </div>
                    
                    {/* Level and XP Display */}
                    <div className="flex items-center space-x-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-400">Level {level}</div>
                            <div className="text-sm text-white/60">Current Level</div>
                        </div>
                        <div className="text-center min-w-[120px]">
                            <div className="text-lg font-bold text-cyan-400">{xp} XP</div>
                            <div className="w-full bg-white/10 rounded-full h-2 mt-1">
                                <div 
                                    className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${xpProgress}%` }}
                                ></div>
                            </div>
                            <div className="text-xs text-white/50 mt-1">{Math.round(xpProgress)}% to next level</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* XP Gain Notification */}
            {xpGainNotification.show && (
                <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 animate-float-up">
                    <div className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-4 py-2 rounded-lg shadow-lg border border-cyan-300">
                        <span className="font-bold">+{xpGainNotification.amount} XP</span>
                    </div>
                </div>
            )}

            {/* Level Up Notification */}
            {levelUpNotification && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-2xl shadow-2xl border-4 border-yellow-300">
                        <div className="text-center">
                            <div className="text-2xl font-bold">🎉 LEVEL UP! 🎉</div>
                            <div className="text-lg font-semibold mt-1">You reached Level {level}!</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Typing Area */}
            <div className="flex flex-col items-center justify-center space-y-8 py-16">
                {/* Word Display */}
                <div className="relative">
                    <div className="flex items-center justify-center space-x-8 text-center">
                        <div className="text-xl text-white/30 font-medium">{words[4]}</div>
                        <div className="text-2xl text-white/50 font-medium">{words[3]}</div>
                        <div className={`text-4xl font-bold px-6 py-3 rounded-xl transition-all duration-300 ${
                            isGold 
                                ? "bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-yellow-300 shadow-lg shadow-yellow-500/25 animate-pulse" 
                                : "text-white bg-white/5"
                        }`}>
                            {words[2]}
                            {isGold && (
                                <div className="text-xs text-yellow-400 font-semibold mt-1">
                                    2x XP & Money!
                                </div>
                            )}
                        </div>
                        <div className="text-2xl text-white/50 font-medium">{words[1]}</div>
                        <div className="text-xl text-white/30 font-medium">{words[0]}</div>
                    </div>
                </div>

                {/* Input Field */}
                <div className="relative w-full max-w-lg">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full px-6 py-4 text-2xl text-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                        placeholder="Start typing..."
                        autoFocus
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>

                {/* Progress Indicator */}
                <div className="w-full max-w-lg">
                    <div className="flex justify-between text-sm text-white/60 mb-2">
                        <span>Progress</span>
                        <span>{inputValue.length}/{words[2]?.length || 0}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${words[2] ? (inputValue.length / words[2].length) * 100 : 0}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
                {lastTypingTestTime !== null && new Date(lastTypingTestTime.getTime() + 60000 * 11) > Date.now() ? (
                    <button 
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                            typingTestBoostActive 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                                : 'bg-white/10 text-white/50 cursor-not-allowed'
                        }`}
                        disabled={!typingTestBoostActive}
                    >
                        {typingTestCountdown}
                    </button>
                ) : (
                    <button 
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                            unlockedFeatures.has('typingTest')
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                                : 'bg-white/10 text-white/50 cursor-not-allowed'
                        }`}
                        onClick={handleTypingTest}
                        disabled={!unlockedFeatures.has('typingTest')}
                    >
                        <span className="flex items-center space-x-2">
                            <span>⚡</span>
                            <span>Typing Test</span>
                        </span>
                    </button>
                )}
                
                <button 
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                        unlockedFeatures.has('difficulty')
                            ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl'
                            : 'bg-white/10 text-white/50 cursor-not-allowed'
                    }`}
                    onClick={handleDifficulty}
                    disabled={!unlockedFeatures.has('difficulty')}
                >
                    <span className="flex items-center space-x-2">
                        <span>⚙️</span>
                        <span>Difficulty</span>
                    </span>
                </button>
                
                <button 
                    className="px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={handleImportExport}
                >
                    <span className="flex items-center space-x-2">
                        <span>💾</span>
                        <span>Import/Export</span>
                    </span>
                </button>
            </div>
        </div>
    );
}