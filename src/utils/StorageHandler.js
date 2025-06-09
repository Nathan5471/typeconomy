import { getAverageLength, getWordMultiplier, getStreakBonus } from "./EffectsHandler.js";
import { getStreak } from "./StatsHandler.js";

export function getStorage(key) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.error(`Error getting item from localStorage: ${error}`);
        return null;
    }
}

export function setStorage(key, value) {
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

export async function getRandomWord(count = 1) {
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
    if (count === 1) {
        return fetchWordByLength(length);
    } else if (count > 1) {
        const words = [];
        for (let i = 0; i < count; i++) {
            const word = await fetchWordByLength(length);
            if (word) {
                words.push(word);
            }
        }
        return words;
    }
}

export function calculateWordValue(word, isGold) {
    if (typeof word !== 'string' || word.length === 0) {
        console.error('Invalid word. It must be a non-empty string.');
        return 0;
    }
    const wordMultiplier = getWordMultiplier();
    const streakBonus = getStreakBonus();
    const currentStreak = getStreak();

    const baseValue = Math.pow(word.length, 4/3)
    const value = baseValue * wordMultiplier + (currentStreak * streakBonus);

    if (isGold) {
        return Math.floor(value * 10);
    }
    return Math.floor(value);
}

export function importSaveFile(saveData) {
    localStorage.clear();
    for (const key in saveData) {
        if (Object.prototype.hasOwnProperty.call(saveData, key)) {
            setStorage(key, JSON.parse(saveData[key]));
        }
    }
    console.log('Save file imported successfully.');
    location.reload();
}

export function exportSaveFile() {
    const saveData = JSON.stringify(localStorage);
    const blob = new Blob([saveData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'typeconomySaveFile.json'
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('Save file exported successfully.');
}