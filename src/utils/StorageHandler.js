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
    setStorage('money', currentMoney + amount);
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
    setStorage('money', currentMoney - amount);
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

export function clearStreak() {
    setStorage('streak', 0);
}

export function getWordMultiplier() {
    return getStorage('wordMultiplier') || 1;
}

export function increaseWordMultiplier(increaseBy) {
    if (typeof increaseBy !== 'number' || isNaN(increaseBy) || increaseBy < 1) {
        console.error('Invalid increase by amount. It must be a positive number.');
        return;
    }
    const currentMultiplier = getWordMultiplier();
    const newMultiplier = currentMultiplier + increaseBy;
    setStorage('wordMultiplier', newMultiplier);
}

export function getAverageLength() {
    return getStorage('averageLength') || 3;
}

export function increaseAverageLength(increaseBy) {
    if (typeof length !== 'number' || isNaN(length) || length < 1) {
        console.error('Invalid increase by amount. It must be a positive number.');
        return;
    }
    const currentAverage = getAverageLength();
    const newAverage = currentAverage + increaseBy;
    if (newAverage > 15) {
        console.warn('Average length cannot exceed 15.');
        return;
    }
    setStorage('averageLength', newAverage);
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
    setStorage('cashPerSecond', cps);
}

export function getUpgradeCashPerSecond(upgradeId) {
    const upgrades = getStorage('upgradeCashPerSecond') || {};
    return upgrades[upgradeId] || 0;
}

export function increaseUpgradeCashPerSecond(upgradeId, increaseBy) {
    if (typeof increaseBy !== 'number' || isNaN(increaseBy) || increaseBy < 0) {
        console.error('Invalid cash per second value. It must be a non-negative number.');
        return;
    }
    const upgrades = getStorage('upgradeCashPerSecond') || {};
    upgrades[upgradeId] += increaseBy;
    setStorage('upgradeCashPerSecond', upgrades);
    let totalCps = 0;
    for (const upgrade in upgrades) {
        totalCps += upgrades[upgrade];
    }
    setTotalCashPerSecond(totalCps);
}

export function getStreakBonus() {
    return getStorage('streakBonus') || 0;
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
    const minLength = Math.max(3, averageLength - 2);
    const maxLength = Math.min(15, averageLength + 2);
    return Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
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