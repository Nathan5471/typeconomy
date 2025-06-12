import React, { useState, useEffect, useCallback } from 'react';
import { useMoney } from '../contexts/MoneyContext.jsx';
import { useOverlayContext } from '../contexts/OverlayContext.jsx';
import { getRandomWord } from '../utils/StorageHandler.js';

export default function TypingTest({closeTypingTest}) {
    const { completeTypingTest, unlockedFeatures } = useMoney();
    const { closeOverlay } = useOverlayContext();
    const [targetText, setTargetText] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [isFinished, setIsFinished] = useState(false);
    const [accuracy, setAccuracy] = useState(0);
    const [wpm, setWpm] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [typingTestBoost, setTypingTestBoost] = useState(1);
    const [sessionLength, setSessionLength] = useState(50);
    const [testMode, setTestMode] = useState('normal');

    useEffect(() => {
        const fetchTargetText = async () => {
            try {
                let wordCount = sessionLength;
                if (testMode === 'marathon' && unlockedFeatures.has('marathonMode')) {
                    wordCount = Math.max(sessionLength, 200);
                } else if (testMode === 'sprint') {
                    wordCount = 25;
                }
                
                const words = await getRandomWord(wordCount);
                setTargetText(words.join(' '));
            } catch (error) {
                console.error('Error fetching words:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchTargetText();
    }, [sessionLength, testMode, unlockedFeatures]);

    const calculateBoost = useCallback((length) => {
        let baseBoost = (wpm / 50) * (length / 15) * (accuracy / 100) + 1;
        
        if (testMode === 'marathon' && length >= 200) {
            baseBoost *= 1.5;
        } else if (testMode === 'sprint' && wpm >= 60) {
            baseBoost *= 1.3;
        }
        
        if (length >= 1000) baseBoost *= 2.0;
        else if (length >= 500) baseBoost *= 1.7;
        else if (length >= 200) baseBoost *= 1.4;
        else if (length >= 100) baseBoost *= 1.2;
        
        setTypingTestBoost(baseBoost);
    }, [wpm, accuracy, testMode]);

    useEffect(() => {
        const calculateStats = () => {
            if (inputValue.length === 0 || targetText.length === 0) return;
            if (!startTime) {
                setStartTime(Date.now());
            }
            const typedChars = inputValue.split('');
            const correctChars = typedChars.filter((char, index) => char === targetText[index]);
            const accuracyPercentage = (correctChars.length / typedChars.length) * 100;
            setAccuracy(accuracyPercentage.toFixed(2));
            const elapsedTime = (Date.now() - startTime) / 60000;
            setWpm(Math.round((correctChars.length / 5) / elapsedTime));
            if (inputValue.length >= targetText.length) {
                calculateBoost(targetText.length);
                setIsFinished(true);
                setInputValue('');
                setStartTime(null);
            }
        }
        calculateStats();
    }, [inputValue, targetText, startTime, calculateBoost]);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    }

    const handleClose = (e) => {
        e.preventDefault();
        if (typingTestBoost > 1) {
            completeTypingTest(wpm, accuracy, targetText.length);
        }
        setTargetText('');
        setInputValue('');
        setIsFinished(false);
        setAccuracy(0);
        setWpm(0);
        setStartTime(null);
        closeTypingTest();
        closeOverlay();
    }

    const getFormattedText = () => {
        return targetText.split('').map((char, index) => {
            const isTyped = index < inputValue.length;
            const isCorrect = isTyped && inputValue[index] === char;

            return (
                <span
                    key={index}
                    className={`${isTyped ? (isCorrect ? 'text-green-500' : 'text-red-500') : 'text-gray-400'}`}
                >
                    {char}
                </span>
            )
        })
    }

    if (loading === true) {
        return (
            <div className="text-white text-center">
                <p>Loading...</p>
            </div>
        )
    }
    if (isFinished) {
        return (
            <div className="text-white space-y-6 mobile-space-y-4">
                <div className="text-center">
                    <h1 className="text-4xl mobile-text-2xl sm-text-xl font-bold text-white mb-4 flex items-center justify-center">
                        <span className="mr-3">🎉</span>
                        {testMode === 'marathon' ? 'Marathon Complete!' : 
                         testMode === 'sprint' ? 'Sprint Complete!' : 'Test Complete!'}
                    </h1>
                    {testMode === 'marathon' && (
                        <div className="text-lg text-purple-400 mb-2">
                            🏃‍♂️ Endurance Champion! Marathon bonus applied!
                        </div>
                    )}
                </div>
                
                <div className="glass-dark rounded-2xl p-6 mobile-p-4 border border-white/10">
                    <div className="grid grid-cols-3 mobile-grid-cols-2 gap-6 mobile-gap-4">
                        <div className="text-center">
                            <div className="text-3xl mobile-text-xl font-bold text-blue-400 mb-2">{accuracy}%</div>
                            <div className="text-white/70 text-sm mobile-text-sm">Accuracy</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl mobile-text-xl font-bold text-orange-400 mb-2">{wpm}</div>
                            <div className="text-white/70 text-sm mobile-text-sm">WPM</div>
                        </div>
                        <div className="text-center mobile-col-span-2">
                            <div className="text-2xl mobile-text-lg font-bold text-purple-400 mb-2">
                                {targetText.split(' ').length} words
                            </div>
                            <div className="text-white/70 text-sm mobile-text-sm">
                                {testMode.charAt(0).toUpperCase() + testMode.slice(1)} Mode
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="glass-dark rounded-2xl p-6 border border-green-500/30">
                    <div className="text-center">
                        <div className="text-green-400 font-semibold mb-2">🚀 Boost Earned!</div>
                        <div className="text-white">
                            For the next minute, words will be worth 
                            <span className="text-green-400 font-bold mx-1">{typingTestBoost.toFixed(2)}x</span>
                            multiplier
                        </div>
                    </div>
                </div>
                
                <button
                    onClick={handleClose}
                    className="w-full glass-dark border border-blue-500/30 text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10 px-6 py-3 mobile-py-2 rounded-2xl font-medium transition-all duration-300 no-touch-hover touch-active"
                >
                    Continue Typing
                </button>
            </div>
        )
    }
    return (
        <div className="text-white space-y-6 mobile-space-y-4">
            <div className="text-center">
                <h1 className="text-4xl mobile-text-2xl sm-text-xl font-bold text-white mb-2 flex items-center justify-center">
                    <span className="mr-3">⚡</span>
                    Typing Test
                </h1>
                <p className="text-white/70 text-sm mobile-text-sm">Type the text as quickly and accurately as possible</p>
            </div>
            
            {/* Test Configuration */}
            <div className="glass-dark rounded-2xl p-6 mobile-p-4 border border-white/10">
                <div className="grid grid-cols-2 mobile-grid-cols-1 gap-4 mobile-gap-2">
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Session Length</label>
                        <select 
                            value={sessionLength} 
                            onChange={(e) => setSessionLength(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                            disabled={loading}
                        >
                            <option value={25}>25 Words (Quick)</option>
                            <option value={50}>50 Words (Standard)</option>
                            <option value={100}>100 Words (Extended)</option>
                            {unlockedFeatures.has('marathonMode') && (
                                <>
                                    <option value={200}>200 Words (Marathon)</option>
                                    <option value={500}>500 Words (Ultra)</option>
                                    <option value={1000}>1000 Words (Extreme)</option>
                                </>
                            )}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Test Mode</label>
                        <select 
                            value={testMode} 
                            onChange={(e) => setTestMode(e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                            disabled={loading}
                        >
                            <option value="normal">Normal Test</option>
                            <option value="sprint">Sprint (25 words)</option>
                            {unlockedFeatures.has('marathonMode') && (
                                <option value="marathon">Marathon Mode</option>
                            )}
                        </select>
                    </div>
                </div>
                
                {testMode === 'marathon' && (
                    <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <span className="text-purple-400">🏃‍♂️</span>
                            <span className="text-sm text-purple-300">Marathon Mode: Extended sessions with bonus rewards!</span>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="glass-dark rounded-2xl p-6 mobile-p-4 border border-white/10">
                <div className="text-lg mobile-text-base sm-text-sm text-white/90 leading-relaxed font-mono bg-white/5 rounded-xl p-4 mobile-p-3 mb-4">
                    {getFormattedText()}
                </div>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 mobile-px-3 mobile-py-2 text-lg mobile-text-base bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                    placeholder="Start typing here..."
                    autoFocus
                />
            </div>
            
            <div className="glass-dark rounded-2xl p-6 mobile-p-4 border border-white/10">
                <div className="grid grid-cols-2 mobile-grid-cols-2 gap-6 mobile-gap-4">
                    <div className="text-center">
                        <div className="text-2xl mobile-text-lg font-bold text-blue-400 mb-1">{accuracy}%</div>
                        <div className="text-white/70 text-sm mobile-text-sm">Accuracy</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl mobile-text-lg font-bold text-orange-400 mb-1">{wpm}</div>
                        <div className="text-white/70 text-sm mobile-text-sm">WPM</div>
                    </div>
                </div>
            </div>
            
            <button
                onClick={handleClose}
                className="w-full glass-dark border border-gray-500/30 text-gray-400 hover:border-gray-500/50 hover:bg-gray-500/10 px-6 py-3 mobile-py-2 rounded-2xl font-medium transition-all duration-300 no-touch-hover touch-active"
            >
                Cancel Test
            </button>
        </div>
    )
}