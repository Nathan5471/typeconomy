import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    const { money, streak, wordMultiplier, averageLength, accuracy, wpm, unlockedFeatures, typingTestBoostActive, lastTypingTestTime, level, xp, xpProgress, handleCorrectWord, handleIncorrectWord } = useMoney();
    const { openOverlay } = useOverlayContext();
    const [words, setWords] = useState([]); // Used to store 5 words (next2, next2, current, last1, last2)
    const [inputValue, setInputValue] = useState('');
    const [fetchNewWord, setFetchNewWord] = useState(true);
    const [isGold, setIsGold] = useState(false);
    const [isTypingTestOpen, setIsTypingTestOpen] = useState(false);
    const [typingTestCountdown, setTypingTestCountdown] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const fetchNewWords = async () => {
            const word1 = await getRandomWord();
            const word2 = await getRandomWord();
            const word3 = await getRandomWord();
            setWords([DifficultyFormat(word1), DifficultyFormat(word2), DifficultyFormat(word3)]);
        }
        fetchNewWords();
        
        // Focus the input field when component mounts
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 100);
    }, []);

    useEffect(() => {
        const fetchNextWord = async () => {
            const newWord = await getRandomWord();
            setWords(prevWords => [DifficultyFormat(newWord), ...prevWords.slice(0, 4)]);
        }
        fetchNextWord();
    }, [fetchNewWord]);

    // Function to create double-click keyboard sound effect
    const playKeyboardSound = () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create double-click sound (two quick clicks)
            const createClick = (delay = 0) => {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    const filter = audioContext.createBiquadFilter();
                    
                    oscillator.connect(filter);
                    filter.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    // Sharp, crisp keyboard click
                    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1800, audioContext.currentTime + 0.005);
                    oscillator.type = 'square';
                    
                    // High-pass filter for crispness
                    filter.type = 'highpass';
                    filter.frequency.setValueAtTime(800, audioContext.currentTime);
                    
                    gainNode.gain.setValueAtTime(0.04, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.03);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.03);
                }, delay);
            };
            
            // Create double-click: first click immediately, second click after 50ms
            createClick(0);
            createClick(50);
            
        } catch (e) {
            // Audio not supported, continue silently
        }
    };

    // Function to create success sound effect for completed words
    const playSuccessSound = (isGold = false) => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            if (isGold) {
                // Special gold success - triumphant chord progression
                const frequencies = [523, 659, 784, 1047]; // C5, E5, G5, C6
                frequencies.forEach((freq, index) => {
                    setTimeout(() => {
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        
                        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                        oscillator.type = 'sine';
                        
                        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.6);
                        
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + 0.6);
                    }, index * 120);
                });
            } else {
                // Regular success - pleasant rising tone
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                // Rising frequency for success feeling
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.2);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.25);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.25);
            }
        } catch (e) {
            // Audio not supported, continue silently
        }
    };

    const compareWords = useCallback(() => {
        if (inputValue === words[2]) {
            handleCorrectWord(words[2], isGold);
            
            // Play success sound effect
            playSuccessSound(isGold);
        } else {
            handleIncorrectWord();
        }
        setIsGold(getIsGoldWord());
        setFetchNewWord(prev => !prev);
        setInputValue('');
    }, [inputValue, words, handleCorrectWord, handleIncorrectWord, isGold]);

    // Handle input change and play keyboard sounds
    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        
        // Play double-click keyboard sound when typing
        if (newValue.length > inputValue.length) {
            playKeyboardSound();
        }
    };

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
        <div 
            className="h-full w-full space-y-8 relative"
            onClick={() => {
                // Focus input when clicking anywhere on the game area (except when overlay is open)
                if (!isTypingTestOpen && inputRef.current) {
                    inputRef.current.focus();
                }
            }}
        >
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
                            <div className="text-2xl font-bold text-orange-400">{wpm}</div>
                            <div className="text-sm text-white/60">WPM</div>
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
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 text-2xl text-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                        placeholder="Start typing..."
                        autoFocus
                        onBlur={(e) => {
                            // Re-focus when clicked away (except when overlay is open)
                            if (!isTypingTestOpen) {
                                setTimeout(() => e.target.focus(), 10);
                            }
                        }}
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
                {lastTypingTestTime !== null && new Date(lastTypingTestTime.getTime() + 60000 * 11) > Date.now() ? (
                    <button 
                        className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                            typingTestBoostActive 
                                ? 'glass-dark border border-green-500/30 text-green-400 hover:border-green-500/50 hover:bg-green-500/10 shadow-lg' 
                                : 'glass-dark border border-white/10 text-white/40 cursor-not-allowed'
                        }`}
                        disabled={!typingTestBoostActive}
                    >
                        {typingTestCountdown}
                    </button>
                ) : (
                    <button 
                        className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                            unlockedFeatures.has('typingTest')
                                ? 'glass-dark border border-blue-500/30 text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10 shadow-lg hover:shadow-xl'
                                : 'glass-dark border border-white/10 text-white/40 cursor-not-allowed'
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
                    className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                        unlockedFeatures.has('difficulty')
                            ? 'glass-dark border border-orange-500/30 text-orange-400 hover:border-orange-500/50 hover:bg-orange-500/10 shadow-lg hover:shadow-xl'
                            : 'glass-dark border border-white/10 text-white/40 cursor-not-allowed'
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
                    className="px-6 py-3 rounded-2xl font-medium glass-dark border border-gray-500/30 text-gray-400 hover:border-gray-500/50 hover:bg-gray-500/10 shadow-lg hover:shadow-xl transition-all duration-300"
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