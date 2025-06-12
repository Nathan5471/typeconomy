import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useMoney } from '../contexts/MoneyContext';
import { useOverlayContext } from '../contexts/OverlayContext';
import { getRandomWord } from '../utils/StorageHandler.js'
import { getIsGoldWord } from '../utils/EffectsHandler.js';
import { calculateWordValue, calculateWordXP } from '../utils/StorageHandler.js';
import FormatMoney from '../utils/FormatMoney.js';
import DifficultyFormat from '../utils/DifficultFormat.js';
import TypingTest from './TypingTest.jsx';
import Difficulty from './Difficulty.jsx';
import ImportExport from './ImportExport.jsx';
import Tooltip from './Tooltip.jsx';

export default function GameArea() {
    const { money, streak, wordMultiplier, averageLength, accuracy, wpm, isTyping, cashPerSecond, unlockedFeatures, typingTestBoostActive, lastTypingTestTime, level, xp, xpProgress, handleCorrectWord, handleIncorrectWord, updateTypingActivity, typingTestBoost } = useMoney();
    const { openOverlay } = useOverlayContext();
    const [words, setWords] = useState([]); // Used to store 5 words (next2, next2, current, last1, last2)
    const [inputValue, setInputValue] = useState('');
    const [fetchNewWord, setFetchNewWord] = useState(true);
    const [isGold, setIsGold] = useState(false);
    const [isTypingTestOpen, setIsTypingTestOpen] = useState(false);
    const [typingTestCountdown, setTypingTestCountdown] = useState(null);

    // Create a single, persistent AudioContext instance
    const audioContextRef = useRef(null);
    
    // Initialize AudioContext once
    useEffect(() => {
        try {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Audio not supported');
        }
        
        // Cleanup on unmount
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    // Helper functions for tooltip calculations
    const calculateExampleWordValue = (wordLength = 5) => {
        const exampleWord = 'a'.repeat(wordLength);
        return calculateWordValue(exampleWord, false, typingTestBoost, typingTestBoostActive);
    };

    const calculateExampleXP = (wordLength = 5) => {
        const exampleWord = 'a'.repeat(wordLength);
        return calculateWordXP(exampleWord, false, streak + 1);
    };

    const getStreakXPMultiplier = () => {
        if (streak >= 50) return 3.0;
        if (streak >= 25) return 2.5;
        if (streak >= 15) return 2.0;
        if (streak >= 10) return 1.8;
        if (streak >= 5) return 1.5;
        if (streak >= 3) return 1.2;
        return 1.0;
    };

    const getLevelBenefits = () => {
        const benefits = [];
        if (level >= 5) benefits.push("Unlocked Difficulty Settings");
        if (level >= 10) benefits.push("Unlocked Typing Tests");
        if (level >= 15) benefits.push("Higher Gold Word Chance");
        if (level >= 20) benefits.push("Better Streak Bonuses");
        return benefits.length > 0 ? benefits : ["No special benefits yet"];
    };

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

    // Function to create double-click keyboard sound effect
    const playKeyboardSound = () => {
        try {
            const audioContext = audioContextRef.current;
            if (!audioContext || audioContext.state === 'closed') return;
            
            // Resume audio context if suspended (required by browser policy)
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            
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
    const playSuccessSound = (isGold = false, currentStreak = 0) => {
        try {
            const audioContext = audioContextRef.current;
            if (!audioContext || audioContext.state === 'closed') return;
            
            // Resume audio context if suspended (required by browser policy)
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            
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
                        
                        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.6);
                        
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + 0.6);
                    }, index * 120);
                });
            } else if (currentStreak >= 20) {
                // Epic streak sound - multiple harmonious tones
                const frequencies = [440, 554, 659, 880]; // A4, C#5, E5, A5
                frequencies.forEach((freq, index) => {
                    setTimeout(() => {
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        
                        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                        oscillator.type = 'sine';
                        
                        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);
                        
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + 0.4);
                    }, index * 80);
                });
            } else if (currentStreak >= 10) {
                // Great streak sound - uplifting progression
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1047, audioContext.currentTime + 0.3);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.35);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.35);
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
            
            // Play success sound effect with current streak
            playSuccessSound(isGold, streak + 1); // +1 because streak will be incremented
        } else {
            handleIncorrectWord();
        }
        setIsGold(getIsGoldWord());
        setFetchNewWord(prev => !prev);
        setInputValue('');
    }, [inputValue, words, handleCorrectWord, handleIncorrectWord, isGold, streak]);

    // Handle direct keyboard input (Monkeytype style)
    const handleKeyDown = useCallback((event) => {
        if (isTypingTestOpen) return; // Prevent keydown events when typing test is open
        
        // Quick restart with Tab key
        if (event.key === 'Tab') {
            event.preventDefault();
            setInputValue('');
            return;
        }
        
        // Prevent default behavior for most keys to avoid page scrolling, etc.
        if (event.key.length === 1 || event.key === 'Backspace' || event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
        }
        
        if (event.key === ' ' || event.key === 'Enter') {
            compareWords();
        } else if (event.key === 'Backspace') {
            setInputValue(prev => prev.slice(0, -1));
            updateTypingActivity(); // Track backspace as typing activity
        } else if (event.key.length === 1) {
            // Only allow single character keys (letters, numbers, symbols)
            const newValue = inputValue + event.key;
            setInputValue(newValue);
            
            // Track typing activity and play sound
            updateTypingActivity();
            playKeyboardSound();
        }
    }, [inputValue, compareWords, isTypingTestOpen, playKeyboardSound, updateTypingActivity]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

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
        <div className="h-full w-full space-y-8 relative">
            {/* Header Stats */}
            <div className="glass-dark rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Tooltip 
                            content={
                                <div>
                                    <div className="font-semibold mb-1">💰 Current Balance</div>
                                    <div className="text-xs space-y-1">
                                        <div>• 5-letter word: +{FormatMoney(calculateExampleWordValue(5))}</div>
                                        <div>• 7-letter word: +{FormatMoney(calculateExampleWordValue(7))}</div>
                                        <div>• Gold word: 10x multiplier!</div>
                                        <div>• Multiplier: {wordMultiplier}x</div>
                                        {typingTestBoostActive && <div className="text-green-400">• Test Boost: {typingTestBoost.toFixed(1)}x</div>}
                                    </div>
                                </div>
                            }
                            position="bottom"
                        >
                            <div className="text-center px-6 cursor-help">
                                <div className="text-3xl font-bold text-white flex items-center justify-center">
                                    <span className="mr-2">💰</span>
                                    <span className={`transition-all duration-500 ${isTyping ? 'animate-pulse text-green-400' : ''}`}>
                                        {FormatMoney(money)}
                                    </span>
                                </div>
                                <div className="text-sm text-white/60">Balance</div>
                            </div>
                        </Tooltip>
                        <div className="w-px h-12 bg-white/20"></div>
                        <Tooltip 
                            content={
                                <div>
                                    <div className="font-semibold mb-1">🔥 Typing Streak</div>
                                    <div className="text-xs space-y-1">
                                        <div>• Current XP multiplier: {getStreakXPMultiplier()}x</div>
                                        <div>• Lose streak on any mistake</div>
                                        <div>• Higher streaks = more XP!</div>
                                        <div className="mt-2 text-white/80">Streak Milestones:</div>
                                        <div>• 5+ words: 1.5x XP</div>
                                        <div>• 10+ words: 1.8x XP</div>
                                        <div>• 25+ words: 2.5x XP</div>
                                        <div>• 50+ words: 3.0x XP</div>
                                    </div>
                                </div>
                            }
                            position="bottom"
                        >
                            <div className="text-center px-6 cursor-help">
                                <div className={`text-2xl font-bold transition-all duration-300 ${streak >= 10 ? 'text-cyan-400' : 'text-blue-400'}`}>{streak}</div>
                                <div className="text-sm text-white/60">Streak</div>
                                {streak >= 3 && (
                                    <div className={`text-xs font-semibold transition-all duration-300 ${
                                        streak >= 50 ? 'text-purple-400' : 
                                        streak >= 25 ? 'text-yellow-400' : 
                                        streak >= 15 ? 'text-orange-400' : 
                                        streak >= 10 ? 'text-green-400' : 'text-cyan-400'
                                    }`}>
                                        {streak >= 50 ? '🔥🔥🔥 3.0x' : 
                                         streak >= 25 ? '🔥🔥 2.5x' : 
                                         streak >= 15 ? '🔥 2.0x' :
                                         streak >= 10 ? '⚡ 1.8x' : 
                                         streak >= 5 ? '✨ 1.5x' : '💫 1.2x'} XP
                                    </div>
                                )}
                            </div>
                        </Tooltip>
                        <div className="w-px h-12 bg-white/20"></div>
                        <Tooltip 
                            content={
                                <div>
                                    <div className="font-semibold mb-1">✅ Typing Accuracy</div>
                                    <div className="text-xs space-y-1">
                                        <div>• Calculated from all-time performance</div>
                                        <div>• Perfect words improve accuracy</div>
                                        <div>• Mistakes lower accuracy</div>
                                        <div>• Higher accuracy = better typing tests</div>
                                    </div>
                                </div>
                            }
                            position="bottom"
                        >
                            <div className="text-center px-6 cursor-help">
                                <div className="text-2xl font-bold text-green-400">{accuracy}%</div>
                                <div className="text-sm text-white/60">Accuracy</div>
                            </div>
                        </Tooltip>
                        <div className="w-px h-12 bg-white/20"></div>
                        <Tooltip 
                            content={
                                <div>
                                    <div className="font-semibold mb-1">⚡ Words Per Minute</div>
                                    <div className="text-xs space-y-1">
                                        <div>• Based on current typing session</div>
                                        <div>• Uses standard 5-character word method</div>
                                        <div>• Requires minimum 3 words for accuracy</div>
                                        <div>• Session resets after 10 second pause</div>
                                        <div>• Smoothed for realistic measurements</div>
                                        <div className="mt-2 text-white/80">WPM Benchmarks:</div>
                                        <div>• 40+ WPM: Good</div>
                                        <div>• 60+ WPM: Great</div>
                                        <div>• 80+ WPM: Excellent</div>
                                        <div>• 100+ WPM: Expert</div>
                                    </div>
                                </div>
                            }
                            position="bottom"
                        >
                            <div className="text-center px-6 cursor-help">
                                <div className={`text-2xl font-bold transition-all duration-300 ${isTyping ? 'text-orange-400' : 'text-orange-400/60'}`}>{wpm}</div>
                                <div className="text-sm text-white/60">WPM</div>
                                {isTyping && (
                                    <div className="text-xs text-orange-400">
                                        🔥 Active
                                    </div>
                                )}
                            </div>
                        </Tooltip>
                        <div className="w-px h-12 bg-white/20"></div>
                        <Tooltip 
                            content={
                                <div>
                                    <div className="font-semibold mb-1">⚡ Word Value Multiplier</div>
                                    <div className="text-xs space-y-1">
                                        <div>• Increases money from each word</div>
                                        <div>• Buy "Better Keys" upgrades to increase</div>
                                        <div>• Example with current multiplier:</div>
                                        <div className="ml-2">→ 5-letter word: {FormatMoney(calculateExampleWordValue(5))}</div>
                                        <div className="ml-2">→ 7-letter word: {FormatMoney(calculateExampleWordValue(7))}</div>
                                    </div>
                                </div>
                            }
                            position="bottom"
                        >
                            <div className="text-center px-6 cursor-help">
                                <div className="text-2xl font-bold text-purple-400">{wordMultiplier}x</div>
                                <div className="text-sm text-white/60">Multiplier</div>
                            </div>
                        </Tooltip>
                        {cashPerSecond > 0 && (
                            <>
                                <div className="w-px h-12 bg-white/20"></div>
                                <Tooltip 
                                    content={
                                        <div>
                                            <div className="font-semibold mb-1">💸 Passive Income</div>
                                            <div className="text-xs space-y-1">
                                                <div>• Earn money automatically</div>
                                                <div>• Buy passive income upgrades in shop</div>
                                                <div>• Works even when not typing</div>
                                                <div>• Balanced to supplement, not replace typing</div>
                                                <div className="mt-2 text-emerald-400">Per minute: {FormatMoney(cashPerSecond * 60)}</div>
                                                <div className="text-emerald-400">Per hour: {FormatMoney(cashPerSecond * 3600)}</div>
                                            </div>
                                        </div>
                                    }
                                    position="bottom"
                                >
                                    <div className="text-center px-6 cursor-help">
                                        <div className="text-2xl font-bold text-emerald-400 flex items-center justify-center">
                                            <span className="mr-1">💸</span>
                                            <span>{FormatMoney(cashPerSecond)}</span>
                                        </div>
                                        <div className="text-sm text-white/60">Per Second</div>
                                        <div className="text-xs text-emerald-400">
                                            🤖 Passive
                                        </div>
                                    </div>
                                </Tooltip>
                                <div className="w-px h-12 bg-white/20"></div>
                            </>
                        )}
                    </div>
                    
                    {/* Level and XP Display */}
                    <div className="flex items-center space-x-6">
                        <Tooltip 
                            content={
                                <div>
                                    <div className="font-semibold mb-1">🌟 Current Level</div>
                                    <div className="text-xs space-y-1">
                                        <div>• Level up by earning XP</div>
                                        <div>• XP from typing words correctly</div>
                                        <div className="mt-2 text-white/80">Level Benefits:</div>
                                        {getLevelBenefits().map((benefit, index) => (
                                            <div key={index}>• {benefit}</div>
                                        ))}
                                        <div className="mt-2 text-cyan-400">Example XP: 5-letter word = {calculateExampleXP(5)} XP</div>
                                    </div>
                                </div>
                            }
                            position="bottom"
                        >
                            <div className="text-center cursor-help">
                                <div className={`text-2xl font-bold transition-all duration-300 ${
                                    level >= 50 ? 'text-purple-400' :
                                    level >= 25 ? 'text-yellow-400' :
                                    level >= 10 ? 'text-orange-400' : 'text-yellow-400'
                                }`}>
                                    Level {level}
                                    {level >= 50 && <span className="ml-1">👑</span>}
                                    {level >= 25 && level < 50 && <span className="ml-1">💎</span>}
                                    {level >= 10 && level < 25 && <span className="ml-1">⭐</span>}
                                </div>
                                <div className="text-sm text-white/60">Current Level</div>
                            </div>
                        </Tooltip>
                        <Tooltip 
                            content={
                                <div>
                                    <div className="font-semibold mb-1">⭐ Experience Points</div>
                                    <div className="text-xs space-y-1">
                                        <div>• Gain XP by typing words correctly</div>
                                        <div>• XP = word length × 2 × streak multiplier</div>
                                        <div>• Gold words give 2x XP</div>
                                        <div>• Higher streaks = more XP per word</div>
                                        <div className="mt-2 text-white/80">Current streak multiplier: {getStreakXPMultiplier()}x</div>
                                    </div>
                                </div>
                            }
                            position="bottom"
                        >
                            <div className="text-center min-w-[120px] cursor-help">
                                <div className="text-lg font-bold text-cyan-400">{xp} XP</div>
                                <div className="w-full bg-white/10 rounded-full h-2 mt-1">
                                    <div 
                                        className={`h-2 rounded-full transition-all duration-500 ${
                                            xpProgress >= 90 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse' :
                                            'bg-gradient-to-r from-cyan-400 to-blue-500'
                                        }`}
                                        style={{ width: `${xpProgress}%` }}
                                    ></div>
                                </div>
                                <div className="text-xs text-white/50 mt-1">
                                    {Math.round(xpProgress)}% to next level
                                    {xpProgress >= 90 && <span className="ml-1">🎯</span>}
                                </div>
                            </div>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* Main Typing Area */}
            <div className="flex flex-col items-center justify-center space-y-8 py-16">
                {/* Horizontal Word Flow */}
                <div className="max-w-4xl mx-auto px-8">
                    <div className="flex items-center justify-center space-x-4 text-2xl font-medium overflow-hidden">
                        {/* Upcoming words (start from the right) */}
                        <div className="flex space-x-4 text-white/40">
                            <span>{words[4]}</span>
                            <span>{words[3]}</span>
                        </div>
                        
                        {/* Current Word with enhanced styling */}
                        <div className={`relative px-6 py-4 rounded-xl transition-all duration-300 ${
                            isGold 
                                ? "text-yellow-400 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 shadow-lg shadow-yellow-500/25" 
                                : "text-white bg-white/10 border border-white/20"
                        } ${isTyping ? 'scale-105 shadow-2xl' : 'scale-100'}`}>
                            
                            <div className="relative text-3xl font-bold">
                                {/* Render each character of the current word */}
                                {words[2] && words[2].split('').map((char, index) => {
                                    let className = '';
                                    if (index < inputValue.length) {
                                        // Character has been typed
                                        if (inputValue[index] === char) {
                                            className = 'text-green-400'; // Correct character
                                        } else {
                                            className = 'text-red-400 bg-red-500/30 px-1 rounded'; // Incorrect character
                                        }
                                    } else if (index === inputValue.length) {
                                        // Current character (cursor position)
                                        className = 'bg-white/70 text-black animate-pulse px-1 rounded shadow-lg';
                                    } else {
                                        // Untyped character
                                        className = isGold ? 'text-yellow-400/70' : 'text-white/70';
                                    }
                                    
                                    return (
                                        <span key={index} className={`${className} transition-all duration-150`}>
                                            {char}
                                        </span>
                                    );
                                })}
                                
                                {/* Show cursor after the word only if there are extra characters beyond the word length */}
                                {inputValue.length > (words[2] || '').length && (
                                    <span className="bg-red-500/70 text-white animate-pulse ml-1 px-1 rounded">|</span>
                                )}
                            </div>
                            
                            {/* Gold indicator */}
                            {isGold && (
                                <div className="absolute -top-2 -right-2 text-xs font-bold text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded-full border border-yellow-500/30">
                                    2x
                                </div>
                            )}
                            
                            {/* Typing speed indicator */}
                            {isTyping && (
                                <div className="absolute -top-1 -left-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                            )}
                        </div>
                        
                        {/* Completed words (move to the left after completion) */}
                        <div className="flex space-x-4 text-white/20">
                            <span>{words[1]}</span>
                            <span>{words[0]}</span>
                        </div>
                    </div>
                    
                    {/* Error message for extra characters */}
                    {inputValue.length > (words[2] || '').length && (
                        <div className="text-center mt-4">
                            <div className="text-sm text-red-400 animate-shake inline-block px-3 py-1 bg-red-500/10 rounded-lg border border-red-500/20">
                                ❌ Extra characters: {inputValue.slice((words[2] || '').length)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Dynamic Typing Instructions */}
                <div className="text-center space-y-1">
                    {!isTyping ? (
                        <div className="text-white/40 text-sm animate-pulse">
                            💤 Start typing to earn money and XP! 
                        </div>
                    ) : streak >= 20 ? (
                        <div className="text-purple-400 text-sm font-semibold">
                            🔥 ON FIRE! Keep the streak alive! 🔥
                        </div>
                    ) : streak >= 10 ? (
                        <div className="text-yellow-400 text-sm font-semibold">
                            ⚡ Amazing streak! You're in the zone! ⚡
                        </div>
                    ) : streak >= 5 ? (
                        <div className="text-green-400 text-sm">
                            ✨ Great streak! Keep it up! ✨
                        </div>
                    ) : (
                        <div className="text-cyan-400 text-sm">
                            🚀 Press Space or Enter to submit word 🚀
                        </div>
                    )}
                    <div className="text-white/20 text-xs">
                        Press Tab to restart • Backspace to delete
                    </div>
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