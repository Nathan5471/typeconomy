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
    return getStorage('wpmData') || { words: [], sessionStart: null, lastWordTime: null };
}

export function addWordForWPM(wordLength) {
    const wpmData = getWPMData();
    const now = Date.now();
    
    // Initialize session start time if this is the first word or if there's been a long gap
    const timeSinceLastWord = wpmData.lastWordTime ? now - wpmData.lastWordTime : 0;
    const isNewSession = !wpmData.sessionStart || timeSinceLastWord > 10000; // 10 second gap = new session
    
    if (isNewSession) {
        wpmData.sessionStart = now;
        wpmData.words = []; // Reset for new session
    }
    
    // Add word with timestamp
    wpmData.words.push({ length: wordLength, timestamp: now });
    wpmData.lastWordTime = now;
    
    // Keep only last 2 minutes of data for WPM calculation (standard practice)
    const twoMinutesAgo = now - (2 * 60 * 1000);
    wpmData.words = wpmData.words.filter(word => word.timestamp > twoMinutesAgo);
    
    // Update session start if we filtered out too much data
    if (wpmData.words.length > 0 && wpmData.sessionStart < twoMinutesAgo) {
        wpmData.sessionStart = wpmData.words[0].timestamp;
    }
    
    setStorage('wpmData', wpmData);
}

export function calculateWPM() {
    const wpmData = getWPMData();
    
    if (!wpmData.words.length || !wpmData.sessionStart) {
        return 0;
    }
    
    // Require at least 3 words for a meaningful WPM calculation
    if (wpmData.words.length < 3) {
        return 0;
    }
    
    // Use actual typing session time, not current time
    const sessionDurationMs = Math.max(wpmData.lastWordTime - wpmData.sessionStart, 5000); // Minimum 5 seconds
    const sessionDurationMinutes = sessionDurationMs / (1000 * 60);
    
    if (sessionDurationMinutes <= 0) {
        return 0;
    }
    
    // Calculate WPM using standard method: (total characters / 5) / time in minutes
    const totalCharacters = wpmData.words.reduce((sum, word) => sum + word.length, 0);
    const standardWords = totalCharacters / 5; // Standard word length is 5 characters
    let wpm = Math.round(standardWords / sessionDurationMinutes);
    
    // Apply smoothing for very short sessions (less than 30 seconds)
    if (sessionDurationMs < 30000) {
        // Reduce WPM for very short bursts to avoid inflated numbers
        const smoothingFactor = sessionDurationMs / 30000; // 0.0 to 1.0
        wpm = Math.round(wpm * (0.7 + 0.3 * smoothingFactor)); // Scale between 70% and 100%
    }
    
    // Cap maximum WPM at reasonable limit to avoid unrealistic numbers
    wpm = Math.min(wpm, 300);
    
    return Math.max(0, wpm);
}

// Session WPM Average Functions
export function getSessionWPMHistory() {
    return getStorage('sessionWPMHistory') || [];
}

export function addSessionWPM(avgWPM) {
    if (avgWPM <= 0) return;
    
    const history = getSessionWPMHistory();
    history.push(avgWPM);
    
    // Keep only last 50 sessions to prevent unlimited growth
    if (history.length > 50) {
        history.shift();
    }
    
    setStorage('sessionWPMHistory', history);
}

export function getAverageSessionWPM() {
    const history = getSessionWPMHistory();
    if (history.length === 0) return 0;
    
    const sum = history.reduce((total, wpm) => total + wpm, 0);
    return Math.round(sum / history.length);
}