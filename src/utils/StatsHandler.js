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
    return getStorage('accuracy') || [100, 0, 0];
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

export function getWPMData() {
    return getStorage('wpmData') || { words: [], sessionStart: null, lastWordTime: null };
}

export function addWordForWPM(wordLength) {
    const wpmData = getWPMData();
    const now = Date.now();
    
    const timeSinceLastWord = wpmData.lastWordTime ? now - wpmData.lastWordTime : 0;
    const isNewSession = !wpmData.sessionStart || timeSinceLastWord > 10000;
    
    if (isNewSession) {
        wpmData.sessionStart = now;
        wpmData.words = [];
    }
    
    wpmData.words.push({ length: wordLength, timestamp: now });
    wpmData.lastWordTime = now;
    
    const twoMinutesAgo = now - (2 * 60 * 1000);
    wpmData.words = wpmData.words.filter(word => word.timestamp > twoMinutesAgo);
    
    if (wpmData.words.length > 0 && wpmData.sessionStart < twoMinutesAgo) {
        wpmData.sessionStart = wpmData.words[0].timestamp;
    }
    
    setStorage('wpmData', wpmData);
}

export function calculateWPM() {
    const wpmData = getWPMData();
    
    if (!wpmData.words.length || !wpmData.sessionStart) {
        return 0;    }
    
    if (wpmData.words.length < 3) {
        return 0;
    }
    
    const sessionDurationMs = Math.max(wpmData.lastWordTime - wpmData.sessionStart, 5000);
    const sessionDurationMinutes = sessionDurationMs / (1000 * 60);

    if (sessionDurationMinutes <= 0) {
        return 0;
    }
    
    const totalCharacters = wpmData.words.reduce((sum, word) => sum + word.length, 0);
    const standardWords = totalCharacters / 5;
    let wpm = Math.round(standardWords / sessionDurationMinutes);
    
    if (sessionDurationMs < 30000) {
        const smoothingFactor = sessionDurationMs / 30000;
        wpm = Math.round(wpm * (0.7 + 0.3 * smoothingFactor));
    }
    
    wpm = Math.min(wpm, 300);
    
    return Math.max(0, wpm);
}

export function getSessionWPMHistory() {
    return getStorage('sessionWPMHistory') || [];
}

export function addSessionWPM(avgWPM) {
    if (avgWPM <= 0) return;
    
    const history = getSessionWPMHistory();
    history.push(avgWPM);
    
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