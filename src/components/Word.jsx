import React, { useState, useEffect, useCallback } from 'react';
import { getRandomWord } from '../utils/StorageHandler.js';

export default function Word({ handleWordCheck }) {
    const [word, setWord] = useState('');
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        async function fetchWord() {
            try {
                const newWord = await getRandomWord();
                setWord(newWord.toLowerCase());
            } catch (error) {
                console.error('Error fetching word:', error);
            }
        }
        fetchWord();
    }, [])

    const compareWords = useCallback(() => {
        if (inputValue.toLowerCase() === word) {
            handleWordCheck(true, word);
        } else {
            handleWordCheck(false);
        }
        setInputValue('');
        async function fetchNewWord() {
            try {
                const newWord = await getRandomWord();
                setWord(newWord.toLowerCase());
            } catch (error) {
                console.error('Error fetching new word:', error);
            }
        }
        fetchNewWord();
    }, [word, inputValue, handleWordCheck]);

    useEffect(() => {
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
    }, [compareWords]);

    return (
        <div className="bg-white flex flex-row p-4 rounded shadow-lg">
            <h2 className="text-2xl mb-4">{word}</h2>
            <input
                type="text"
                className="ml-4 p-2 border rounded"
                placeholder="Type the word here..."
                onChange={(e) => setInputValue(e.target.value)}
                value={inputValue}
            />
        </div>
    );
}