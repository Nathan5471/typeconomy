function getStorage(key) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.error(`Error getting item from localStorage: ${error}`);
        return null;
    }
}

function setStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error setting item in localStorage: ${error}`);
    }
}

export function getMoney() {
    return getStorage('money') || 0;
}

export function setMoney(money) {
    if (typeof money !== 'number' || isNaN(money)) {
        console.error('Invalid money value. It must be a number.');
        return;
    }
    setStorage('money', money);
}

export function getWordsTyped() {
    return getStorage('wordsTyped') || 0;
}

export function incrementWordType() {
    const wordsTyped = getWordsTyped();
    setStorage('wordsTyped', wordsTyped + 1);
}

export function getAmountOfUpgrades(upgradeId) {
    const upgrades = getStorage('upgrades') || {};
    return upgrades[upgradeId] || 0;
}

export function incrementAmountOfUpgrades(upgradeId) {
    const upgrades = getStorage('upgrades') || {};
    upgrades[upgradeId] = (upgrades[upgradeId] || 0) + 1;
    setStorage('upgrades', upgrades);
}

export function getStreak() {
    return getStorage('streak') || 0;
}

export function incrementStreak() {
    const streak = getStreak();
    setStorage('streak', streak + 1);
}

export function resetStreak() {
    setStorage('streak', 0);
}

export function getAverageLength() {
    return getStorage('averageLength') || 3;
}

export function setAverageLength(length) {
    if (typeof length !== 'number' || isNaN(length) || length < 1) {
        console.error('Invalid average length. It must be a positive number.');
        return;
    }
    setStorage('averageLength', length);
}

export function generateRandomLength(averageLength) {
    const minLength = Math.max(3, averageLength - 2);
    const maxLength = Math.min(15, averageLength + 2);
    return Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
}

export function getRandomWord() {
    const averageLength = getAverageLength();
    const length = generateRandomLength(averageLength);
    // TODO: Get list of words with length as a dictionary
}