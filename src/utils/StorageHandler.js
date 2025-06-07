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

export function increaseMoney(amount) {
    if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
        console.error('Invalid money value. It must be a non-negative number.');
        return;
    }
    const currentMoney = getMoney();
    setStorage('money', Math.floor(currentMoney + amount));
}

export function decreaseMoney(amount) {
    if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
        console.error('Invalid money value. It must be a non-negative number.');
        return;
    }
    const currentMoney = getMoney();
    if (currentMoney < amount) {
        console.warn('Insufficient funds to decrease money.');
        return;
    }
    setStorage('money', Math.floor(currentMoney - amount));
}

export function getWordsTyped() {
    return getStorage('wordsTyped') || 0;
}

export function incrementWordsType() {
    const wordsTyped = getWordsTyped();
    setStorage('wordsTyped', wordsTyped + 1);
}

export function getAmountOfUpgrades(upgradeId) {
    const upgrades = getStorage('upgrades') || {};
    return upgrades[upgradeId] || 0;
}

export function incrementAmountOfUpgrades(upgradeId, amount) {
    const upgrades = getStorage('upgrades') || {};
    upgrades[upgradeId] = (upgrades[upgradeId] || 0) + amount;
    setStorage('upgrades', upgrades);
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

export function getWordMultiplier() {
    return Number(getStorage('wordMultiplier')) || 1;
}

export function increaseWordMultiplier(increaseBy) {
    if (typeof increaseBy !== 'number' || isNaN(increaseBy) || increaseBy < 0) {
        console.error('Invalid increase by amount. It must be a positive number. Amount:', increaseBy);
        return;
    }
    const currentMultiplier = getWordMultiplier();
    const newMultiplier = currentMultiplier + increaseBy;
    setStorage('wordMultiplier', newMultiplier.toFixed(1));
}

export function getAverageLength() {
    return Number(getStorage('averageLength')) || 3;
}

export function increaseAverageLength(increaseBy) {
    if (typeof length !== 'number' || isNaN(length) || length < 0) {
        console.error('Invalid increase by amount. It must be a positive number. Amount:', increaseBy);
        return;
    }
    const currentAverage = getAverageLength();
    const newAverage = currentAverage + increaseBy;
    if (newAverage > 15) {
        console.warn('Average length cannot exceed 15.');
        return;
    }
    setStorage('averageLength', newAverage.toFixed(1));
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

export function getTotalCashPerSecond() {
    const cashPerSecond = getStorage('cashPerSecond');
    const wordMultiplier = getWordMultiplier();
    return (cashPerSecond || 0) * wordMultiplier;
}

function setTotalCashPerSecond(cps) {
    if (typeof cps !== 'number' || isNaN(cps) || cps < 0) {
        console.error('Invalid cash per second value. It must be a non-negative number.');
        return;
    }
    setStorage('cashPerSecond', cps.toFixed(0));
}

export function getUpgradeCashPerSecond(upgradeId) {
    const upgrades = getStorage('upgradeCashPerSecond') || {};
    return upgrades[upgradeId] || 0;
}

export function increaseUpgradeCashPerSecond(upgradeId, increaseBy) {
    if (typeof increaseBy !== 'number' || isNaN(increaseBy) || increaseBy < 0) {
        console.error('Invalid increase cash per second by value. It must be a non-negative number.');
        return;
    }
    const upgrades = getStorage('upgradeCashPerSecond') || {[upgradeId]: 0};
    if (!upgrades[upgradeId]) {
        upgrades[upgradeId] = 0;
    }
    upgrades[upgradeId] += increaseBy;
    setStorage('upgradeCashPerSecond', upgrades);
    let totalCps = 0;
    for (const upgrade in upgrades) {
        totalCps += upgrades[upgrade];
    }
    setTotalCashPerSecond(totalCps);
}

export function getStreakBonus() {
    return getStorage('streakBonus') || 1;
}

export function increaseStreakBonus(increaseBy) {
    if (typeof increaseBy !== 'number' || isNaN(increaseBy) || increaseBy < 0) {
        console.error('Invalid increase by value. It must be a non-negative number.');
        return;
    }
    const currentBonus = getStreakBonus();
    const newBonus = currentBonus + increaseBy;
    setStorage('streakBonus', newBonus);
}

export function generateRandomLength(averageLength) {
    const possibleLengths = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    const weights = possibleLengths.map(length => Math.exp(-Math.abs(length - averageLength)));

    // Normalize weights to sum to 1 for Math.random selection
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const normalizedWeights = weights.map(weight => weight / totalWeight);

    const randomValue = Math.random();
    let cumulativeWeight = 0;

    for (let i = 0; i < normalizedWeights.length; i++) {
        cumulativeWeight += normalizedWeights[i];
        if (randomValue < cumulativeWeight) {
            return possibleLengths[i];
        }
    }
}

export function getRandomWord() {
    const averageLength = getAverageLength();
    const length = generateRandomLength(averageLength);
    async function fetchWordByLength(length) {
        try {
            const response = await fetch(`/words/words_${length}.txt`)
            const wordList = await response.text();
            const words = wordList.split('\n').filter(word => word.trim() !== '');
            if (words.length === 0) {
                console.error(`No words found for length ${length}`);
                return null;
            }
            const randomWord = words[Math.floor(Math.random() * words.length)];
            return randomWord.trim();
        } catch (error) {
            console.error(`Error fetching words of length ${length}: ${error}`);
            return null;
        }
    }
    return fetchWordByLength(length);
}

export function calculateWordValue(word) {
    if (typeof word !== 'string' || word.length === 0) {
        console.error('Invalid word. It must be a non-empty string.');
        return 0;
    }
    const wordMultiplier = getWordMultiplier();
    const streakBonus = getStreakBonus();
    const currentStreak = getStreak();

    const baseValue = Math.pow(word.length, 4/3)
    const value = baseValue * wordMultiplier + (currentStreak * streakBonus);
    return Math.floor(value);
}