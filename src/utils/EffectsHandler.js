import { getStorage, setStorage } from './StorageHandler.js';

export function getAmountOfUpgrades(upgradeId) {
    const upgrades = getStorage('upgrades') || {};
    return upgrades[upgradeId] || 0;
}

export function incrementAmountOfUpgrades(upgradeId, amount) {
    const upgrades = getStorage('upgrades') || {};
    upgrades[upgradeId] = (upgrades[upgradeId] || 0) + amount;
    setStorage('upgrades', upgrades);
}

export function getPurchasedOneTimeUpgrades() {
    const upgrades = getStorage('purchasedOneTimeUpgrades') || [];
    return upgrades;
}

export function markOneTimeUpgradeAsPurchased(upgradeId) {
    const currentUpgrades = getPurchasedOneTimeUpgrades();
    if (!currentUpgrades.includes(upgradeId)) {
        currentUpgrades.push(upgradeId);
        setStorage('purchasedOneTimeUpgrades', currentUpgrades);
    } else {
        console.warn(`Upgrade ${upgradeId} has already been purchased.`);
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

export function getIsGoldWord() {
    const chance = getStorage('goldWordChance') || 0.01;
    return Math.random() < chance;
}

export function increaseGoldWordChance(increaseBy) {
    if (typeof increaseBy !== 'number' || isNaN(increaseBy) || increaseBy < 0) {
        console.error('Invalid increase by value. It must be a non-negative number.');
        return;
    }
    const currentChance = getStorage('goldWordChance') || 0;
    const newChance = Math.min(currentChance + increaseBy, 1); // Cap at 1 (100%)
    setStorage('goldWordChance', newChance);
}

export function getDifficulty() {
    return getStorage('difficulty') || {'upper': false, 'numbers': false, 'symbols': false}
}

export function changeDifficulty(difficulty) {
    const unlockedFeatures = getUnlockedFeatures();
    if (!unlockedFeatures.includes('difficulty')) {
        console.warn('Difficulty feature is not unlocked. Cannot set difficulty.');
        return;
    }
    setStorage('difficulty', difficulty);
}

export function getUnlockedFeatures() {
    const features = getStorage('unlockedFeatures') || [];
    return features;
}

export function unlockFeature(feature) {
    const currentFeatures = getUnlockedFeatures();
    if (!currentFeatures.includes(feature)) {
        currentFeatures.push(feature);
        setStorage('unlockedFeatures', currentFeatures);
    } else {
        console.warn(`Feature ${feature} is already unlocked.`);
    }
}