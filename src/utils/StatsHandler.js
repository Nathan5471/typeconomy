import { getStorage, setStorage } from './StorageHandler.js';

export function getWordsTyped() {
    return getStorage('wordsTyped') || 0;
}

export function incrementWordsTyped() {
    const wordsTyped = getWordsTyped();
    setStorage('wordsTyped', wordsTyped + 1);
}

export function getStreak() {
    return getStorage('streak') || 0;
}

export function incrementStreak() {
    const streak = getStreak();
    setStorage('streak', streak + 1);
}

export function clearStreak() {
    checkForNewHighestStreak();
    setStorage('streak', 0);
}

export function getHighestStreak() {
    return getStorage('highestStreak') || 0;
}

function checkForNewHighestStreak() {
    const currentStreak = getStreak();
    const highestStreak = getHighestStreak();
    if (currentStreak > highestStreak) {
        setStorage('highestStreak', currentStreak);
    }
}

export function getAccuracy() {
    return getStorage('accuracy') || [100, 0, 0]; // [accuracy, correct, incorrect]
}

export function addWordToAccuracy(isCorrect) {
    const [accuracy, correct, incorrect] = getAccuracy();
    if (isCorrect === true) {
        const newCorrect = correct + 1;
        const newAccuracy = ((newCorrect / (newCorrect + incorrect)) * 100).toFixed(1);
        setStorage('accuracy', [newAccuracy, newCorrect, incorrect]);
    } else if (isCorrect === false) {
        const newIncorrect = incorrect + 1;
        const newAccuracy = ((correct / (correct + newIncorrect)) * 100).toFixed(1);
        setStorage('accuracy', [newAccuracy, correct, newIncorrect]);
    } else {
        console.error('Invalid isCorrect value. It must be true or false.');
        return;
    }
}

// WPM Calculation Functions
export function getWPMData() {
    return getStorage('wpmData') || { words: [], startTime: null };
}

export function addWordForWPM(wordLength) {
    const wpmData = getWPMData();
    const now = Date.now();
    
    // Initialize start time if this is the first word
    if (!wpmData.startTime) {
        wpmData.startTime = now;
    }
    
    // Add word with timestamp
    wpmData.words.push({ length: wordLength, timestamp: now });
    
    // Keep only last 5 minutes of data for accurate WPM calculation
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    wpmData.words = wpmData.words.filter(word => word.timestamp > fiveMinutesAgo);
    
    setStorage('wpmData', wpmData);
}

export function calculateWPM() {
    const wpmData = getWPMData();
    
    if (!wpmData.words.length || !wpmData.startTime) {
        return 0;
    }
    
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    
    // Use only recent words (last 5 minutes) for current WPM
    const recentWords = wpmData.words.filter(word => word.timestamp > fiveMinutesAgo);
    
    if (recentWords.length === 0) {
        return 0;
    }
    
    // Calculate time span in minutes
    const timeSpanMs = Math.max(now - recentWords[0].timestamp, 1000); // Minimum 1 second
    const timeSpanMinutes = timeSpanMs / (1000 * 60);
    
    if (timeSpanMinutes <= 0) {
        return 0;
    }
    
    // Calculate WPM (standard word is 5 characters)
    const totalCharacters = recentWords.reduce((sum, word) => sum + word.length, 0);
    const wordsTyped = totalCharacters / 5; // Standard word length
    const wpm = Math.round(wordsTyped / timeSpanMinutes);
    
    return Math.max(0, wpm);
}