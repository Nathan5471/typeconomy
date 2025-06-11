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
    const [particles, setParticles] = useState([]);
    const [typingParticles, setTypingParticles] = useState([]);

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

    // Function to create money sound effect
    const playMoneySound = (baseFreq = 440, isGold = false) => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            if (isGold) {
                // Special gold sound - ascending notes
                const frequencies = [523, 659, 784]; // C5, E5, G5
                frequencies.forEach((freq, index) => {
                    setTimeout(() => {
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        
                        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                        oscillator.type = 'triangle';
                        
                        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
                        
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + 0.15);
                    }, index * 80);
                });
            } else {
                // Regular money sound - coin clink
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, audioContext.currentTime + 0.1);
                oscillator.type = 'triangle';
                
                gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
            }
        } catch (e) {
            // Audio not supported, continue silently
        }
    };

    const compareWords = useCallback(() => {
        if (inputValue === words[2]) {
            handleCorrectWord(words[2], isGold);
            
            // Generate purple particles at bottom based on XP amount
            const xpGained = calculateWordXP(words[2], isGold, streak + 1);
            const numParticles = Math.min(xpGained, 15); // Cap at 15 particles for performance
            
            const newParticles = [];
            for (let i = 0; i < numParticles; i++) {
                newParticles.push({
                    id: Date.now() + i,
                    x: 20 + Math.random() * 60, // Random X position between 20% and 80%
                    delay: i * 80, // Stagger the particles
                    size: isGold ? 'w-3 h-3' : 'w-2 h-2'
                });
            }
            
            setParticles(newParticles);
            
            // Clean up particles after animation
            setTimeout(() => setParticles([]), 3500);
            
            // Play money sound effect
            const baseFreq = 440 + (xpGained * 20);
            playMoneySound(baseFreq, isGold);
        } else {
            handleIncorrectWord();
        }
        setIsGold(getIsGoldWord());
        setFetchNewWord(prev => !prev);
        setInputValue('');
    }, [inputValue, words, handleCorrectWord, handleIncorrectWord, isGold, streak]);

    // Handle input change and create typing particles
    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        
        // Create typing particles when typing
        if (newValue.length > inputValue.length) {
            const newTypingParticle = {
                id: Date.now() + Math.random(),
                x: 45 + Math.random() * 10, // Around the input field
                y: 45 + Math.random() * 10,
                delay: 0
            };
            
            setTypingParticles(prev => [...prev, newTypingParticle]);
            
            // Clean up typing particle after animation
            setTimeout(() => {
                setTypingParticles(prev => prev.filter(p => p.id !== newTypingParticle.id));
            }, 1500);
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
        <div className="h-full w-full space-y-8 relative">
            {/* Background Purple Dots */}
            <div className="fixed bottom-0 left-0 right-0 h-32 pointer-events-none z-10">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-purple-400/30 rounded-full animate-fade-pulse"
                        style={{
                            left: `${5 + (i * 4.5)}%`,
                            bottom: `${10 + Math.sin(i) * 15}px`,
                            animationDelay: `${i * 0.3}s`,
                            animationDuration: `${2 + Math.random() * 2}s`
                        }}
                    ></div>
                ))}
            </div>

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

            {/* Purple XP Particles at Bottom */}
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className={`fixed bottom-4 z-30 pointer-events-none animate-particle-bottom ${particle.size} bg-purple-500 rounded-full opacity-70`}
                    style={{
                        left: `${particle.x}%`,
                        animationDelay: `${particle.delay}ms`
                    }}
                ></div>
            ))}

            {/* Typing Particles */}
            {typingParticles.map((particle) => (
                <div
                    key={particle.id}
                    className="fixed z-20 pointer-events-none animate-typing-particle w-1 h-1 bg-purple-400 rounded-full opacity-60"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        animationDelay: `${particle.delay}ms`
                    }}
                ></div>
            ))}

            {/* Simple Level Up Notification */}
            {levelUpNotification && (
                <div className="fixed top-6 right-6 z-40 animate-level-up-simple pointer-events-none">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-lg shadow-lg border-2 border-yellow-300">
                        <div className="flex items-center space-x-2">
                            <span className="text-lg">🎉</span>
                            <span className="font-bold">Level {level}!</span>
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
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 text-2xl text-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                        placeholder="Start typing..."
                        autoFocus
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
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