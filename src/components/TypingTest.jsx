import React, { useState, useEffect, useCallback } from 'react';
import { useMoney } from '../contexts/MoneyContext.jsx';
import { useOverlayContext } from '../contexts/OverlayContext.jsx';
import { getRandomWord } from '../utils/StorageHandler.js';

export default function TypingTest({closeTypingTest}) {
    const { completeTypingTest } = useMoney();
    const { closeOverlay } = useOverlayContext();
    const [targetText, setTargetText] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [isFinished, setIsFinished] = useState(false);
    const [accuracy, setAccuracy] = useState(0);
    const [wpm, setWpm] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [typingTestBoost, setTypingTestBoost] = useState(1);

    useEffect(() => {
        const fetchTargetText = async () => {
            try {
                const words = await getRandomWord(25);
                setTargetText(words.join(' '));
            } catch (error) {
                console.error('Error fetching words:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchTargetText();
    }, []);

    const calculateBoost = useCallback((length) => {
        setTypingTestBoost((wpm / 50) * (length / 15) * (accuracy / 100) + 1);
    }, [wpm, accuracy]);

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
            <div className="text-white space-y-6">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center">
                        <span className="mr-3">🎉</span>
                        Test Complete!
                    </h1>
                </div>
                
                <div className="glass-dark rounded-2xl p-6 border border-white/10">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-400 mb-2">{accuracy}%</div>
                            <div className="text-white/70">Accuracy</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-orange-400 mb-2">{wpm}</div>
                            <div className="text-white/70">WPM</div>
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
                    className="w-full glass-dark border border-blue-500/30 text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10 px-6 py-3 rounded-2xl font-medium transition-all duration-300"
                >
                    Continue Typing
                </button>
            </div>
        )
    }
    return (
        <div className="text-white space-y-6">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center">
                    <span className="mr-3">⚡</span>
                    Typing Test
                </h1>
                <p className="text-white/70">Type the text as quickly and accurately as possible</p>
            </div>
            
            <div className="glass-dark rounded-2xl p-6 border border-white/10">
                <div className="text-lg text-white/90 leading-relaxed font-mono bg-white/5 rounded-xl p-4 mb-4">
                    {getFormattedText()}
                </div>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 text-lg bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                    placeholder="Start typing here..."
                    autoFocus
                />
            </div>
            
            <div className="glass-dark rounded-2xl p-6 border border-white/10">
                <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400 mb-1">{accuracy}%</div>
                        <div className="text-white/70">Accuracy</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-400 mb-1">{wpm}</div>
                        <div className="text-white/70">WPM</div>
                    </div>
                </div>
            </div>
            
            <button
                onClick={handleClose}
                className="w-full glass-dark border border-gray-500/30 text-gray-400 hover:border-gray-500/50 hover:bg-gray-500/10 px-6 py-3 rounded-2xl font-medium transition-all duration-300"
            >
                Cancel Test
            </button>
        </div>
    )
}