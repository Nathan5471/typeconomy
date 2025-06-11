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
    const { money, streak, wordMultiplier, averageLength, accuracy, unlockedFeatures, typingTestBoostActive, lastTypingTestTime, level, xp, xpProgress, handleCorrectWord, handleIncorrectWord } = useMoney();
    const { openOverlay } = useOverlayContext();
    const [words, setWords] = useState([]); // Used to store 5 words (next2, next2, current, last1, last2)
    const [inputValue, setInputValue] = useState('');
    const [fetchNewWord, setFetchNewWord] = useState(true);
    const [isGold, setIsGold] = useState(false);
    const [isTypingTestOpen, setIsTypingTestOpen] = useState(false);
    const [typingTestCountdown, setTypingTestCountdown] = useState(null);
    const [cursorParticles, setCursorParticles] = useState([]);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const inputRef = useRef(null);

    // Mouse tracking for cursor particles
    useEffect(() => {
        let animationId;
        let mouseX = 0;
        let mouseY = 0;
        let isMoving = false;
        let moveTimer = null;
        
        const handleMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            setMousePosition({ x: mouseX, y: mouseY });
            isMoving = true;
            
            // Clear existing timer
            if (moveTimer) clearTimeout(moveTimer);
            
            // Stop movement detection after 50ms (more responsive)
            moveTimer = setTimeout(() => {
                isMoving = false;
            }, 50);
        };
        
        const createParticle = () => {
            const now = Date.now();
            
            // Only create particles when moving
            if (!isMoving) return;
            
            const particleCount = 3; // Consistent particle count when moving
            const particlesToAdd = [];
            
            for (let i = 0; i < particleCount; i++) {
                const angle = (Math.PI * 2 * i) / particleCount;
                const distance = Math.random() * 15 + 5;
                
                const newParticle = {
                    id: now + Math.random() + i,
                    x: mouseX + Math.cos(angle) * distance * Math.random(),
                    y: mouseY + Math.sin(angle) * distance * Math.random(),
                    createdAt: now,
                    opacity: 1,
                    size: Math.random() * 8 + 2, // Size between 2-10px
                    color: Math.floor(Math.random() * 360), // Random hue
                    velocityX: (Math.random() - 0.5) * 4,
                    velocityY: (Math.random() - 0.5) * 4 - 2, // Upward bias
                    life: 600 + Math.random() * 600, // Live for 600-1200ms
                    spin: (Math.random() - 0.5) * 10 // Rotation speed
                };
                particlesToAdd.push(newParticle);
            }
            
            setCursorParticles(prev => [...prev, ...particlesToAdd]);
        };
        
        const updateParticles = () => {
            const now = Date.now();
            
            setCursorParticles(prev => 
                prev.map(particle => {
                    const age = now - particle.createdAt;
                    const lifeRatio = age / particle.life;
                    
                    return {
                        ...particle,
                        x: particle.x + particle.velocityX,
                        y: particle.y + particle.velocityY,
                        opacity: Math.max(0, 1 - lifeRatio * lifeRatio), // Quadratic fade
                        size: particle.size * (1 - lifeRatio * 0.3), // Gradual shrink
                        velocityX: particle.velocityX * 0.98, // Air resistance
                        velocityY: particle.velocityY * 0.98 + 0.15, // Gravity + air resistance
                        spin: particle.spin + (particle.spin * 0.02) // Accelerating spin
                    };
                }).filter(particle => now - particle.createdAt < particle.life)
            );
            
            // Only create new particles when cursor is actively moving
            if (isMoving && Math.random() < 0.7) { // 70% chance each frame when moving
                createParticle();
            }
            
            animationId = requestAnimationFrame(updateParticles);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        updateParticles();
        
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            if (moveTimer) clearTimeout(moveTimer);
            cancelAnimationFrame(animationId);
        };
    }, []);

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

    // Function to create keyboard click sound effect
    const playKeyboardSound = () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create a realistic keyboard click sound
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            const filter = audioContext.createBiquadFilter();
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // High frequency click with quick decay
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.01);
            oscillator.type = 'square';
            
            // Filter to make it sound more like a click
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(400, audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.05);
        } catch (e) {
            // Audio not supported, continue silently
        }
    };

    // Function to create word completion sound effect  
    const playWordCompleteSound = (isGold = false) => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            if (isGold) {
                // Special gold sound - magical chime
                const frequencies = [523, 659, 784, 988]; // C5, E5, G5, B5
                frequencies.forEach((freq, index) => {
                    setTimeout(() => {
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        
                        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                        oscillator.type = 'sine';
                        
                        gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);
                        
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + 0.4);
                    }, index * 100);
                });
            } else {
                // Regular word complete sound - satisfying pop
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(660, audioContext.currentTime + 0.1);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.06, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.15);
            }
        } catch (e) {
            // Audio not supported, continue silently
        }
    };

    const compareWords = useCallback(() => {
        if (inputValue === words[2]) {
            handleCorrectWord(words[2], isGold);
            
            // Play word completion sound effect
            playWordCompleteSound(isGold);
            
            // Create celebration burst particles
            const celebrationParticles = [];
            const now = Date.now();
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            for (let i = 0; i < (isGold ? 20 : 12); i++) {
                const angle = (Math.PI * 2 * i) / (isGold ? 20 : 12);
                const distance = 50 + Math.random() * 100;
                
                celebrationParticles.push({
                    id: now + 2000 + i,
                    x: centerX + Math.cos(angle) * distance,
                    y: centerY + Math.sin(angle) * distance,
                    createdAt: now,
                    opacity: 1,
                    size: Math.random() * 10 + (isGold ? 8 : 5),
                    color: isGold ? 45 + Math.random() * 30 : Math.random() * 360, // Gold colors or rainbow
                    velocityX: Math.cos(angle) * (3 + Math.random() * 4),
                    velocityY: Math.sin(angle) * (3 + Math.random() * 4),
                    life: 800 + Math.random() * 400,
                    spin: (Math.random() - 0.5) * 20
                });
            }
            
            setCursorParticles(prev => [...prev, ...celebrationParticles]);
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
        
        // Play keyboard click sound when typing
        if (newValue.length > inputValue.length) {
            playKeyboardSound();
            
            // Create burst of particles around input when typing
            const inputRect = e.target.getBoundingClientRect();
            const centerX = inputRect.left + inputRect.width / 2;
            const centerY = inputRect.top + inputRect.height / 2;
            
            const burstParticles = [];
            const now = Date.now();
            
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 * i) / 8;
                const distance = 30 + Math.random() * 20;
                
                burstParticles.push({
                    id: now + 1000 + i,
                    x: centerX + Math.cos(angle) * distance,
                    y: centerY + Math.sin(angle) * distance,
                    createdAt: now,
                    opacity: 1,
                    size: Math.random() * 6 + 4,
                    color: 200 + Math.random() * 160, // Blue to purple range
                    velocityX: Math.cos(angle) * 2,
                    velocityY: Math.sin(angle) * 2,
                    life: 400 + Math.random() * 200,
                    spin: (Math.random() - 0.5) * 15
                });
            }
            
            setCursorParticles(prev => [...prev, ...burstParticles]);
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
            {/* Custom Cursor */}
            <div
                className="fixed pointer-events-none z-[60] w-3 h-3 rounded-full bg-white shadow-lg"
                style={{
                    left: `${mousePosition.x}px`,
                    top: `${mousePosition.y}px`,
                    transform: 'translate(-50%, -50%)',
                    boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
                    transition: 'opacity 0.2s ease'
                }}
            ></div>

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

            {/* Cursor Trail Particles */}
            {cursorParticles.map((particle) => (
                <div
                    key={particle.id}
                    className="fixed pointer-events-none z-50 rounded-full"
                    style={{
                        left: `${particle.x}px`,
                        top: `${particle.y}px`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        background: `radial-gradient(circle, hsl(${particle.color}, 90%, 70%) 0%, hsl(${particle.color}, 80%, 50%) 50%, transparent 100%)`,
                        opacity: particle.opacity,
                        transform: `translate(-50%, -50%) rotate(${particle.spin}deg)`,
                        boxShadow: `
                            0 0 ${particle.size * 2}px hsl(${particle.color}, 90%, 70%),
                            0 0 ${particle.size * 4}px hsl(${particle.color}, 80%, 50%),
                            inset 0 0 ${particle.size}px hsl(${particle.color}, 100%, 80%)
                        `,
                        filter: `blur(${Math.max(0, particle.size * 0.1)}px)`,
                        mixBlendMode: 'screen'
                    }}
                ></div>
            ))}

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