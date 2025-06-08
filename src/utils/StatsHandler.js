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