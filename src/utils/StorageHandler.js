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
    const possibleLengths = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    const weights = possibleLengths.map(length => Math.exp(-Math.abs(length - averageLength)));

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
            const fileLength = length > 15 ? 15 : length;
            const response = await fetch(`/words/words_${fileLength}.txt`)
            const wordList = await response.text();
            let words = wordList.split('\n').filter(word => word.trim() !== '');
            
            if (length > 15) {
                words = words.filter(word => word.trim().length >= length);
                if (words.length === 0) {
                    words = wordList.split('\n').filter(word => word.trim().length >= 12);
                }
            }
            
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
        const word = await fetchWordByLength(length);
        return word.toLowerCase();
    } else if (count > 1) {
        const words = [];
        for (let i = 0; i < count; i++) {
            const word = await fetchWordByLength(length);
            if (word) {
                words.push(word.toLowerCase());
            }
        }
        return words;
    }
}

export function getTypingTestInformation() {
    const typingTestBoost = getStorage('typingTestBoost') || 1;
    const typingTestBoostIsActive = getStorage('typingTestBoostIsActive') || false;
    let lastTypingTestTime = null;
    try {
        lastTypingTestTime = new Date(getStorage('lastTypingTestTime'));
    } catch (error) {
        console.error(`Error parsing lastTypingTestTime: ${error}`);
        lastTypingTestTime = null;
    }

    return {
        typingTestBoost,
        typingTestBoostIsActive,
        lastTypingTestTime
    };
}

export function updateTypingTestInformation(typingTestBoost, typingTestBoostIsActive, lastTypingTestTime) {
    if (typeof typingTestBoost !== 'number' || typingTestBoost <= 0) {
        console.error('Invalid typing test boost value. It must be a positive number.');
        return;
    }
    setStorage('typingTestBoost', typingTestBoost);
    setStorage('typingTestBoostIsActive', typingTestBoostIsActive);
    if (lastTypingTestTime instanceof Date) {
        setStorage('lastTypingTestTime', lastTypingTestTime);
    } else {
        setStorage('lastTypingTestTime', null);
    }
}

export function calculateWordValue(word, isGold, typingTestBoost, typingTestBoostIsActive) {
    if (typeof word !== 'string' || word.length === 0) {
        console.error('Invalid word. It must be a non-empty string.');
        return 0;
    }
    const wordMultiplier = getWordMultiplier();
    const streakBonus = getStreakBonus();
    const currentStreak = getStreak();

    let baseValue = Math.pow(word.length, 4/3)
    if (/[A-Z]/.test(word)) {
        baseValue *= 1.5;
    }
    if (/[0-9]/.test(word)) {
        baseValue *= 1.5;
    }
    if (/[!@#$%^&*()_+[]{}|;:,.<>?]/.test(word)) {
        baseValue *= 2;
    }
    const value = baseValue * wordMultiplier + (currentStreak * streakBonus);

    if (isGold) {
        return Math.floor(value * 10);
    }

    if (typingTestBoostIsActive) {
        return Math.floor(value * typingTestBoost);
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

export function getLevel() {
    return getStorage('level') || 1;
}

export function getXP() {
    return getStorage('xp') || 0;
}

export function setLevel(level) {
    setStorage('level', level);
}

export function setXP(xp) {
    setStorage('xp', xp);
}

export function addXP(amount) {
    if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
        console.error('Invalid XP value. It must be a non-negative number.');
        return;
    }
    const currentXP = getXP();
    const newXP = currentXP + amount;
    setXP(newXP);
    return newXP;
}

export function calculateXPForLevel(level) {
    return Math.floor(Math.pow(level, 2) * 100);
}

export function getXPForNextLevel(currentLevel) {
    return calculateXPForLevel(currentLevel + 1);
}

export function getXPProgress(currentXP, currentLevel) {
    const currentLevelXP = currentLevel > 1 ? calculateXPForLevel(currentLevel) : 0;
    const nextLevelXP = calculateXPForLevel(currentLevel + 1);
    const progressXP = currentXP - currentLevelXP;
    const requiredXP = nextLevelXP - currentLevelXP;
    return Math.min(100, Math.max(0, (progressXP / requiredXP) * 100));
}

export function checkLevelUp(currentXP, currentLevel) {
    const nextLevelXP = calculateXPForLevel(currentLevel + 1);
    if (currentXP >= nextLevelXP) {
        setLevel(currentLevel + 1);
        return true;
    }
    return false;
}

export function calculateStreakXPBonus(streak) {
    if (streak >= 50) return 3.0;
    if (streak >= 25) return 2.5;
    if (streak >= 15) return 2.0;
    if (streak >= 10) return 1.8;
    if (streak >= 5) return 1.5;
    if (streak >= 3) return 1.2;
    return 1.0;
}

export function calculateWordXP(word, isGold, streak) {
    const baseXP = word.length * 2;
    const goldBonus = isGold ? 2.0 : 1.0;
    const streakBonus = calculateStreakXPBonus(streak);
    
    return Math.floor(baseXP * goldBonus * streakBonus);
}