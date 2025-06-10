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
            <div className="text-white text-center">
                <h1 className="text-4xl">Test Finished!</h1>
                <div className="mt-4 flex flex-row items-center justify-around">
                    <div className="flex flex-col items-center">
                        <h2 className="text-2xl">Accuracy</h2>
                        <p className="text-lg">{accuracy}%</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <h2 className="text-2xl">WPM</h2>
                        <p className="text-lg">{wpm}</p>
                    </div>
                </div>
                <p className="mt-4 text-lg">For the next minute, words you type with be worth {typingTestBoost.toFixed(2)}x</p>
                <button
                    onClick={handleClose}
                    className="mt-4 bg-blue-500 text-white p-2 rounded"
                >
                    Close
                </button>
            </div>
        )
    }
    return (
        <div className="text-white">
            <h1 className="text-4xl text-center">Typing Test</h1>
            <p className="text-xl">{getFormattedText()}</p>
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                className="border p-2 rounded-md text-lg w-full"
                autoFocus
            />
            <div className="mt-4 flex flex-row items-center justify-around">
                <div className="flex flex-col items-center">
                    <h2 className="text-2xl">Accuracy</h2>
                    <p className="text-lg">{accuracy}%</p>
                </div>
                <div className="flex flex-col items-center">
                    <h2 className="text-2xl">WPM</h2>
                    <p className="text-lg">{wpm}</p>
                </div>
            </div>
            <button
                onClick={handleClose}
                className="mt-4 bg-[#005828] text-white p-2 rounded w-full text-xl"
            >
                Close
            </button>
        </div>
    )
}