import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useMoney } from '../contexts/MoneyContext';
import { useOverlayContext } from '../contexts/OverlayContext';
import { getRandomWord } from '../utils/StorageHandler.js'
import { getIsGoldWord } from '../utils/EffectsHandler.js';
import { calculateWordValue, calculateWordXP } from '../utils/StorageHandler.js';
import { addSessionWPM } from '../utils/StatsHandler.js';
import FormatMoney from '../utils/FormatMoney.js';
import DifficultyFormat from '../utils/DifficultFormat.js';
import TypingTest from './TypingTest.jsx';
import Difficulty from './Difficulty.jsx';
import ImportExport from './ImportExport.jsx';
import SessionSummary from './SessionSummary.jsx';
import Tooltip from './Tooltip.jsx';

export default function GameArea() {
    const { money, streak, wordMultiplier, averageLength, accuracy, wpm, isTyping, cashPerSecond, unlockedFeatures, typingTestBoostActive, lastTypingTestTime, level, xp, xpProgress, handleCorrectWord, handleIncorrectWord, updateTypingActivity, typingTestBoost } = useMoney();
    const { openOverlay, closeOverlay } = useOverlayContext();
    const [words, setWords] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [fetchNewWord, setFetchNewWord] = useState(true);
    const [isGold, setIsGold] = useState(false);
    const [isTypingTestOpen, setIsTypingTestOpen] = useState(false);
    const [typingTestCountdown, setTypingTestCountdown] = useState(null);
    
    const [sessionActive, setSessionActive] = useState(false);
    const [sessionStartTime, setSessionStartTime] = useState(null);
    const [sessionWordsTyped, setSessionWordsTyped] = useState(0);
    const [sessionMoney, setSessionMoney] = useState(0);
    const [sessionDuration, setSessionDuration] = useState(0);
    const [targetWordCount, setTargetWordCount] = useState(100);
    const [sessionAccuracy, setSessionAccuracy] = useState(100);
    const [sessionCorrectWords, setSessionCorrectWords] = useState(0);
    const [sessionIncorrectWords, setSessionIncorrectWords] = useState(0);
    const [sessionPeakStreak, setSessionPeakStreak] = useState(0);

    const audioContextRef = useRef(null);
    
    const sessionTimerRef = useRef(null);
    
    useEffect(() => {
        try {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Audio not supported');
        }
        
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            if (sessionTimerRef.current) {
                clearInterval(sessionTimerRef.current);
            }
        };
    }, []);

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

    const startSession = () => {
        setSessionActive(true);
        setSessionStartTime(new Date());
        setSessionWordsTyped(0);
        setSessionMoney(0);
        setSessionDuration(0);
        setSessionAccuracy(100);
        setSessionCorrectWords(0);
        setSessionIncorrectWords(0);
        setSessionPeakStreak(0);
        
        sessionTimerRef.current = setInterval(() => {
            setSessionDuration(prev => prev + 1);
        }, 1000);
    };

    const stopSession = () => {
        setSessionActive(false);
        if (sessionTimerRef.current) {
            clearInterval(sessionTimerRef.current);
            sessionTimerRef.current = null;
        }
        
        const avgWPM = sessionDuration > 0 ? Math.round((sessionWordsTyped * 60) / sessionDuration) : 0;
        const finalAccuracy = sessionWordsTyped > 0 ? (sessionCorrectWords / sessionWordsTyped) * 100 : 100;
        
        addSessionWPM(avgWPM);
        
        const sessionStats = {
            duration: sessionDuration,
            wordsTyped: sessionWordsTyped,
            moneyEarned: sessionMoney,
            avgWPM: avgWPM,
            accuracy: finalAccuracy,
            streak: sessionPeakStreak
        };
        
        openOverlay(<SessionSummary sessionStats={sessionStats} onClose={() => closeOverlay()} />);
    };

    const resetSession = () => {
        setSessionWordsTyped(0);
        setSessionMoney(0);
        setSessionDuration(0);
        setSessionAccuracy(100);
        setSessionCorrectWords(0);
        setSessionIncorrectWords(0);
        setSessionPeakStreak(0);
        if (sessionActive) {
            setSessionStartTime(new Date());
        }
    };

    const formatSessionTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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

    const playKeyboardSound = () => {
        try {
            const audioContext = audioContextRef.current;
            if (!audioContext || audioContext.state === 'closed') return;
            
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            
            const createClick = (delay = 0) => {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    const filter = audioContext.createBiquadFilter();
                    
                    oscillator.connect(filter);
                    filter.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1800, audioContext.currentTime + 0.005);
                    oscillator.type = 'square';
                    
                    filter.type = 'highpass';
                    filter.frequency.setValueAtTime(800, audioContext.currentTime);
                    
                    gainNode.gain.setValueAtTime(0.04, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.03);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.03);
                }, delay);
            };
            
            createClick(0);
            createClick(50);
            
        } catch (e) {
        }
    };

    const playSuccessSound = (isGold = false, currentStreak = 0) => {
        try {
            const audioContext = audioContextRef.current;
            if (!audioContext || audioContext.state === 'closed') return;
            
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            
            if (isGold) {
                const frequencies = [523, 659, 784, 1047];
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
                const frequencies = [440, 554, 659, 880];
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
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.2);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.25);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.25);
            }
        } catch (e) {
        }
    };

    const compareWords = useCallback(() => {
        if (inputValue === words[2]) {
            const wordValue = calculateWordValue(words[2], isGold, typingTestBoost, typingTestBoostActive);
            handleCorrectWord(words[2], isGold);
            
            if (sessionActive) {
                setSessionWordsTyped(prev => prev + 1);
                setSessionMoney(prev => prev + wordValue);
                setSessionCorrectWords(prev => prev + 1);
                
                if (streak + 1 > sessionPeakStreak) {
                    setSessionPeakStreak(streak + 1);
                }
                
                if (sessionWordsTyped + 1 >= targetWordCount) {
                    setTimeout(() => stopSession(), 100);
                }
            }
            
            playSuccessSound(isGold, streak + 1);
        } else {
            handleIncorrectWord();
            
            if (sessionActive) {
                setSessionWordsTyped(prev => prev + 1);
                setSessionIncorrectWords(prev => prev + 1);
            }
        }
        
        if (sessionActive) {
            const totalWords = sessionWordsTyped + 1;
            const correctWords = inputValue === words[2] ? sessionCorrectWords + 1 : sessionCorrectWords;
            setSessionAccuracy((correctWords / totalWords) * 100);
        }
        
        setIsGold(getIsGoldWord());
        setFetchNewWord(prev => !prev);
        setInputValue('');
    }, [inputValue, words, handleCorrectWord, handleIncorrectWord, isGold, streak, sessionActive, sessionWordsTyped, sessionCorrectWords, sessionPeakStreak, targetWordCount, typingTestBoost, typingTestBoostActive, stopSession]);

    const handleKeyDown = useCallback((event) => {
        if (isTypingTestOpen) return;
        
        if (!sessionActive && event.key !== 'F1' && event.key !== 'F2') {
            return;
        }
        
        if (event.key === 'Tab') {
            event.preventDefault();
            setInputValue('');
            return;
        }
        
        if (event.key === 'F1') {
            event.preventDefault();
            if (!sessionActive) {
                startSession();
            } else {
                stopSession();
            }
            return;
        }
        
        if (event.key === 'F2') {
            event.preventDefault();
            resetSession();
            return;
        }
        
        if (event.key.length === 1 || event.key === 'Backspace' || event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
        }
        
        if (event.key === ' ' || event.key === 'Enter') {
            compareWords();
        } else if (event.key === 'Backspace') {
            setInputValue(prev => prev.slice(0, -1));
            updateTypingActivity();
        } else if (event.key.length === 1) {
            const newValue = inputValue + event.key;
            setInputValue(newValue);
            
            updateTypingActivity();
            playKeyboardSound();
        }
    }, [inputValue, compareWords, isTypingTestOpen, playKeyboardSound, updateTypingActivity, sessionActive, startSession, stopSession, resetSession]);

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

    const handleCountdown = (startTime, duration ) => {
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
            handleCountdown(lastTypingTestTime, 60000);
        } else if (typingTestBoostActive === false && new Date(lastTypingTestTime.getTime() + 60000) < new Date() && new Date(lastTypingTestTime.getTime() + 60000 * 11) > new Date()) {
            handleCountdown(new Date(lastTypingTestTime.getTime() + 60000), (60000 * 10));
        } else {
            setTypingTestCountdown(null);
        }
    }, [typingTestBoostActive, lastTypingTestTime]);

    return (
        <div className="h-full w-full space-y-8 relative">
            {/* Session Control Panel */}
            <div className="glass-dark rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <div className="text-center">
                            <div className="text-xl font-bold flex items-center" 
                                 style={{ color: sessionActive ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                                <span className="mr-2">{sessionActive ? '▶️' : '⏸️'}</span>
                                <span>{formatSessionTime(sessionDuration)}</span>
                            </div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {sessionActive ? 'Session Active' : 'Session Stopped'}
                            </div>
                        </div>
                        
                        <div className="w-px h-12" style={{ backgroundColor: 'var(--border-primary)' }}></div>
                        
                        <div className="text-center">
                            <div className="text-lg font-bold" style={{ color: 'var(--accent-blue)' }}>
                                {sessionWordsTyped}/{targetWordCount}
                            </div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Words</div>
                        </div>
                        
                        <div className="w-px h-12" style={{ backgroundColor: 'var(--border-primary)' }}></div>
                        
                        <div className="text-center">
                            <div className="text-lg font-bold" style={{ color: 'var(--accent-yellow)' }}>
                                {FormatMoney(sessionMoney)}
                            </div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Session Earned</div>
                        </div>
                        
                        {sessionActive && sessionWordsTyped > 0 && (
                            <>
                                <div className="w-px h-12" style={{ backgroundColor: 'var(--border-primary)' }}></div>
                                <div className="text-center">
                                    <div className="text-lg font-bold" style={{ color: 'var(--accent-green)' }}>
                                        {sessionAccuracy.toFixed(1)}%
                                    </div>
                                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Session Accuracy</div>
                                </div>
                            </>
                        )}
                    </div>
                    
                    <div className="flex space-x-2">
                        <select 
                            value={targetWordCount} 
                            onChange={(e) => setTargetWordCount(Number(e.target.value))}
                            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                            disabled={sessionActive}
                        >
                            <option value={50}>50 Words</option>
                            <option value={100}>100 Words</option>
                            <option value={200}>200 Words</option>
                            <option value={500}>500 Words</option>
                            <option value={1000}>1000 Words</option>
                        </select>
                        
                        <button 
                            onClick={sessionActive ? stopSession : startSession}
                            className="px-4 py-2 rounded-lg font-medium transition-all duration-300"
                            style={{
                                background: sessionActive ? 'var(--accent-red-bg)' : 'var(--accent-green-bg)',
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                borderColor: sessionActive ? 'var(--accent-red-border)' : 'var(--accent-green-border)',
                                color: sessionActive ? 'var(--accent-red)' : 'var(--accent-green)'
                            }}
                        >
                            {sessionActive ? 'Stop (F1)' : 'Start (F1)'}
                        </button>
                        
                        <button 
                            onClick={resetSession}
                            className="px-4 py-2 rounded-lg font-medium transition-all duration-300"
                            style={{
                                background: 'var(--glass-bg)',
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                borderColor: 'var(--border-primary)',
                                color: 'var(--text-secondary)'
                            }}
                            disabled={sessionActive}
                        >
                            Reset (F2)
                        </button>
                    </div>
                </div>
            </div>

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
                                        {typingTestBoostActive && <div style={{ color: 'var(--accent-green)' }}>• Test Boost: {typingTestBoost.toFixed(1)}x</div>}
                                    </div>
                                </div>
                            }
                            position="bottom"
                        >
                            <div className="text-center px-6 cursor-help">
                                <div className="text-3xl font-bold flex items-center justify-center" style={{ color: 'var(--text-primary)' }}>
                                    <span className="mr-2">💰</span>
                                    <span className="transition-all duration-500" 
                                          style={{ 
                                              color: 'var(--text-primary)',
                                              animation: isTyping ? 'pulse 2s infinite' : 'none'
                                          }}>
                                        {FormatMoney(money)}
                                    </span>
                                </div>
                                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Balance</div>
                            </div>
                        </Tooltip>
                        <Tooltip 
                            content={
                                <div>
                                    <div className="font-semibold mb-1">Typing Streak</div>
                                    <div className="text-xs space-y-1">
                                        <div>• Current XP multiplier: {getStreakXPMultiplier()}x</div>
                                        <div>• Lose streak on any mistake</div>
                                        <div>• Higher streaks = more XP!</div>
                                        <div className="mt-2" style={{ color: 'var(--text-secondary)' }}>Streak Milestones:</div>
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
                                <div className="text-2xl font-bold transition-all duration-300" 
                                     style={{ color: streak >= 10 ? 'var(--accent-cyan)' : 'var(--accent-blue)' }}>{streak}</div>
                                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Streak</div>
                                {streak >= 3 && (
                                    <div className="text-xs font-semibold transition-all duration-300" 
                                         style={{ 
                                             color: streak >= 50 ? 'var(--accent-purple)' : 
                                                    streak >= 25 ? 'var(--accent-yellow)' : 
                                                    streak >= 15 ? 'var(--accent-orange)' : 
                                                    streak >= 10 ? 'var(--accent-green)' : 'var(--accent-cyan)'
                                         }}>
                                        {streak >= 50 ? '3.0x' : 
                                         streak >= 25 ? '2.5x' : 
                                         streak >= 15 ? '2.0x' :
                                         streak >= 10 ? '1.8x' : 
                                         streak >= 5 ? '1.5x' : '1.2x'} XP
                                    </div>
                                )}
                            </div>
                        </Tooltip>
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
                                <div className="text-2xl font-bold" style={{ color: 'var(--accent-green)' }}>{accuracy}%</div>
                                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Accuracy</div>
                            </div>
                        </Tooltip>
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
                                <div className="text-2xl font-bold" style={{ color: 'var(--accent-purple)' }}>{wordMultiplier}x</div>
                                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Multiplier</div>
                            </div>
                        </Tooltip>
                        {cashPerSecond > 0 && (
                            <>
                                <div className="w-px h-12" style={{ backgroundColor: 'var(--border-primary)' }}></div>
                                <Tooltip 
                                    content={
                                        <div>
                                            <div className="font-semibold mb-1">💸 Passive Income</div>
                                            <div className="text-xs space-y-1">
                                                <div>• Earn money automatically</div>
                                                <div>• Buy passive income upgrades in shop</div>
                                                <div>• Works even when not typing</div>
                                                <div>• Balanced to supplement, not replace typing</div>
                                                <div className="mt-2" style={{ color: 'var(--accent-green)' }}>Per minute: {FormatMoney(cashPerSecond * 60)}</div>
                                                <div style={{ color: 'var(--accent-green)' }}>Per hour: {FormatMoney(cashPerSecond * 3600)}</div>
                                            </div>
                                        </div>
                                    }
                                    position="bottom"
                                >
                                    <div className="text-center px-6 cursor-help">
                                        <div className="text-2xl font-bold flex items-center justify-center" style={{ color: 'var(--accent-green)' }}>
                                            <span className="mr-1">💸</span>
                                            <span>{FormatMoney(cashPerSecond)}</span>
                                        </div>
                                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Per Second</div>
                                        <div className="text-xs" style={{ color: 'var(--accent-green)' }}>
                                            🤖 Passive
                                        </div>
                                    </div>
                                </Tooltip>
                                <div className="w-px h-12" style={{ backgroundColor: 'var(--border-primary)' }}></div>
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
                                        <div className="mt-2" style={{ color: 'var(--text-secondary)' }}>Level Benefits:</div>
                                        {getLevelBenefits().map((benefit, index) => (
                                            <div key={index}>• {benefit}</div>
                                        ))}
                                        <div className="mt-2" style={{ color: 'var(--accent-cyan)' }}>Example XP: 5-letter word = {calculateExampleXP(5)} XP</div>
                                    </div>
                                </div>
                            }
                            position="bottom"
                        >
                            <div className="text-center cursor-help">
                                <div className="text-2xl font-bold transition-all duration-300" 
                                     style={{ 
                                         color: level >= 50 ? 'var(--accent-purple)' :
                                                level >= 25 ? 'var(--accent-yellow)' :
                                                level >= 10 ? 'var(--accent-orange)' : 'var(--accent-yellow)'
                                     }}>
                                    Level {level}
                                    {level >= 50 && <span className="ml-1">👑</span>}
                                    {level >= 25 && level < 50 && <span className="ml-1">💎</span>}
                                    {level >= 10 && level < 25 && <span className="ml-1">⭐</span>}
                                </div>
                                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Current Level</div>
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
                                        <div className="mt-2" style={{ color: 'var(--text-secondary)' }}>Current streak multiplier: {getStreakXPMultiplier()}x</div>
                                    </div>
                                </div>
                            }
                            position="bottom"
                        >
                            <div className="text-center min-w-[120px] cursor-help">
                                <div className="text-lg font-bold" style={{ color: 'var(--accent-cyan)' }}>{xp} XP</div>
                                <div className="w-full rounded-full h-2 mt-1" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                    <div 
                                        className="h-2 rounded-full transition-all duration-500"
                                        style={{ 
                                            width: `${xpProgress}%`,
                                            background: xpProgress >= 90 ? 
                                                'linear-gradient(to right, var(--accent-yellow), var(--accent-orange))' :
                                                'linear-gradient(to right, var(--accent-cyan), var(--accent-blue))',
                                            animation: xpProgress >= 90 ? 'pulse 2s infinite' : 'none'
                                        }}
                                    ></div>
                                </div>
                                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
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
                        <div className="flex space-x-4" style={{ color: 'var(--text-muted)' }}>
                            <span>{words[4]}</span>
                            <span>{words[3]}</span>
                        </div>
                        
                        {/* Current Word with enhanced styling */}
                        <div className="relative px-6 py-4 rounded-xl transition-all duration-300"
                             style={{
                                 color: !sessionActive ? 'var(--text-disabled)' : 
                                        isGold ? 'var(--accent-yellow)' : 'var(--text-primary)',
                                 background: !sessionActive ? 'var(--bg-disabled)' :
                                            isGold ? 'linear-gradient(to right, var(--accent-yellow-bg), var(--accent-yellow-bg))' : 'var(--bg-secondary)',
                                 border: !sessionActive ? '1px solid var(--border-disabled)' :
                                        isGold ? '1px solid var(--accent-yellow-border)' : '1px solid var(--border-primary)',
                                 boxShadow: !sessionActive ? 'none' :
                                           isGold ? '0 10px 15px -3px var(--accent-yellow-bg), 0 4px 6px -2px var(--accent-yellow-bg)' : 'none',
                                 transform: (isTyping && sessionActive) ? 'scale(1.05)' : 'scale(1)',
                                 ...(isTyping && sessionActive && { boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }),
                                 opacity: sessionActive ? 1 : 0.5
                             }}>
                            
                            <div className="relative text-3xl font-bold">
                                {/* Render each character of the current word */}
                                {words[2] && words[2].split('').map((char, index) => {
                                    let style = {};
                                    let className = 'transition-all duration-150';
                                    
                                    if (index < inputValue.length) {
                                        if (inputValue[index] === char) {
                                            style.color = 'var(--accent-green)';
                                        } else {
                                            style.color = 'var(--accent-red)';
                                            style.backgroundColor = 'var(--accent-red-bg)';
                                            className += ' px-1 rounded';
                                        }
                                    } else if (index === inputValue.length) {
                                        style.backgroundColor = 'var(--cursor-bg)';
                                        style.color = 'var(--cursor-text)';
                                        className += ' animate-pulse px-1 rounded shadow-lg';
                                    } else {
                                        style.color = isGold ? 'var(--accent-yellow-muted)' : 'var(--text-muted)';
                                    }
                                    
                                    return (
                                        <span key={index} className={className} style={style}>
                                            {char}
                                        </span>
                                    );
                                })}
                                
                                {/* Show cursor after the word only if there are extra characters beyond the word length */}
                                {inputValue.length > (words[2] || '').length && (
                                    <span className="animate-pulse ml-1 px-1 rounded text-white" 
                                          style={{ backgroundColor: 'var(--accent-red-bg)' }}>|</span>
                                )}
                            </div>
                            
                            {/* Gold indicator */}
                            {isGold && (
                                <div className="absolute -top-2 -right-2 text-xs font-bold px-2 py-1 rounded-full border" 
                                     style={{ 
                                         color: 'var(--accent-yellow)', 
                                         backgroundColor: 'var(--accent-yellow-bg)',
                                         borderColor: 'var(--accent-yellow-border)'
                                     }}>
                                    2x
                                </div>
                            )}
                            
                            {/* Typing speed indicator */}
                            {isTyping && (
                                <div className="absolute -top-1 -left-1 w-3 h-3 rounded-full animate-ping" 
                                     style={{ backgroundColor: 'var(--accent-green)' }}></div>
                            )}
                        </div>
                        
                        {/* Completed words (move to the left after completion) */}
                        <div className="flex space-x-4" style={{ color: 'var(--text-disabled)' }}>
                            <span>{words[1]}</span>
                            <span>{words[0]}</span>
                        </div>
                    </div>
                    
                    {/* Error message for extra characters */}
                    {inputValue.length > (words[2] || '').length && (
                        <div className="text-center mt-4">
                            <div className="text-sm animate-shake inline-block px-3 py-1 rounded-lg border" 
                                 style={{ 
                                     color: 'var(--accent-red)', 
                                     backgroundColor: 'var(--accent-red-bg)',
                                     borderColor: 'var(--accent-red-border)'
                                 }}>
                                ❌ Extra characters: {inputValue.slice((words[2] || '').length)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Dynamic Typing Instructions */}
                <div className="text-center space-y-1">
                    {!sessionActive ? (
                        <div className="text-sm animate-pulse" style={{ color: 'var(--accent-blue)' }}>
                            🚀 Press Start or F1 to begin your typing session! 
                        </div>
                    ) : !isTyping ? (
                        <div className="text-sm animate-pulse" style={{ color: 'var(--text-muted)' }}>
                            💤 Session active - Start typing to earn money and XP! 
                        </div>
                    ) : streak >= 20 ? (
                        <div className="text-sm font-semibold" style={{ color: 'var(--accent-purple)' }}>
                            ON FIRE! Keep the streak alive!
                        </div>
                    ) : streak >= 10 ? (
                        <div className="text-sm font-semibold" style={{ color: 'var(--accent-yellow)' }}>
                            ⚡ Amazing streak! You're in the zone! ⚡
                        </div>
                    ) : streak >= 5 ? (
                        <div className="text-sm" style={{ color: 'var(--accent-green)' }}>
                            ✨ Great streak! Keep it up! ✨
                        </div>
                    ) : (
                        <div className="text-sm" style={{ color: 'var(--accent-cyan)' }}>
                            🚀 Press Space or Enter to submit word 🚀
                        </div>
                    )}
                    <div className="text-xs" style={{ color: 'var(--text-disabled)' }}>
                        {sessionActive ? 
                            `Session: ${sessionWordsTyped}/${targetWordCount} words • Press Tab to restart • F1 to stop` :
                            'Press F1 to start session • Tab to restart • Backspace to delete'
                        }
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
                {lastTypingTestTime !== null && new Date(lastTypingTestTime.getTime() + 60000 * 11) > Date.now() ? (
                    <button 
                        className="px-6 py-3 rounded-2xl font-medium transition-all duration-300 shadow-lg"
                        style={{
                            background: 'var(--glass-bg)',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: typingTestBoostActive ? 'var(--accent-green-border)' : 'var(--border-primary)',
                            color: typingTestBoostActive ? 'var(--accent-green)' : 'var(--text-disabled)',
                            cursor: typingTestBoostActive ? 'pointer' : 'not-allowed'
                        }}
                        onMouseEnter={(e) => {
                            if (typingTestBoostActive) {
                                e.target.style.borderColor = 'var(--accent-green)';
                                e.target.style.backgroundColor = 'var(--accent-green-bg)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (typingTestBoostActive) {
                                e.target.style.borderColor = 'var(--accent-green-border)';
                                e.target.style.backgroundColor = 'var(--glass-bg)';
                            }
                        }}
                        disabled={!typingTestBoostActive}
                    >
                        {typingTestCountdown}
                    </button>
                ) : (
                    <button 
                        className="px-6 py-3 rounded-2xl font-medium transition-all duration-300 shadow-lg"
                        style={{
                            background: 'var(--glass-bg)',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: unlockedFeatures.has('typingTest') ? 'var(--accent-blue-border)' : 'var(--border-primary)',
                            color: unlockedFeatures.has('typingTest') ? 'var(--accent-blue)' : 'var(--text-disabled)',
                            cursor: unlockedFeatures.has('typingTest') ? 'pointer' : 'not-allowed'
                        }}
                        onMouseEnter={(e) => {
                            if (unlockedFeatures.has('typingTest')) {
                                e.target.style.borderColor = 'var(--accent-blue)';
                                e.target.style.backgroundColor = 'var(--accent-blue-bg)';
                                e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (unlockedFeatures.has('typingTest')) {
                                e.target.style.borderColor = 'var(--accent-blue-border)';
                                e.target.style.backgroundColor = 'var(--glass-bg)';
                                e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                            }
                        }}
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
                    className="px-6 py-3 rounded-2xl font-medium transition-all duration-300 shadow-lg"
                    style={{
                        background: 'var(--glass-bg)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: unlockedFeatures.has('difficulty') ? 'var(--accent-orange-border)' : 'var(--border-primary)',
                        color: unlockedFeatures.has('difficulty') ? 'var(--accent-orange)' : 'var(--text-disabled)',
                        cursor: unlockedFeatures.has('difficulty') ? 'pointer' : 'not-allowed'
                    }}
                    onMouseEnter={(e) => {
                        if (unlockedFeatures.has('difficulty')) {
                            e.target.style.borderColor = 'var(--accent-orange)';
                            e.target.style.backgroundColor = 'var(--accent-orange-bg)';
                            e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (unlockedFeatures.has('difficulty')) {
                            e.target.style.borderColor = 'var(--accent-orange-border)';
                            e.target.style.backgroundColor = 'var(--glass-bg)';
                            e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                        }
                    }}
                    onClick={handleDifficulty}
                    disabled={!unlockedFeatures.has('difficulty')}
                >
                    <span className="flex items-center space-x-2">
                        <span>⚙️</span>
                        <span>Difficulty</span>
                    </span>
                </button>
                
                <button 
                    className="px-6 py-3 rounded-2xl font-medium transition-all duration-300 shadow-lg"
                    style={{
                        background: 'var(--glass-bg)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'var(--text-secondary)',
                        color: 'var(--text-secondary)'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.borderColor = 'var(--text-primary)';
                        e.target.style.backgroundColor = 'var(--bg-secondary)';
                        e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.borderColor = 'var(--text-secondary)';
                        e.target.style.backgroundColor = 'var(--glass-bg)';
                        e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                    }}
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