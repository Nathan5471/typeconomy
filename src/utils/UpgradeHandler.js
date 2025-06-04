import { getAmountOfUpgrades, incrementAmountOfUpgrades, increaseWordMultiplier, increaseAverageLength, increaseUpgradeCashPerSecond, increaseStreakBonus } from "./StorageHandler";

export function calculateUpgradeCost(baseCost, costMultiplier, upgradeId) {
    const amount = getAmountOfUpgrades(upgradeId);
    return Math.floor(baseCost * Math.pow(costMultiplier, amount));
}

export function canAffordUpgrade(money, cost) {
    return money >= cost;
}

export function buyUpgrade(upgradeId, baseCost, costMultiplier, currentMoney) {
    const cost = calculateUpgradeCost(baseCost, costMultiplier, upgradeId);
    if (!canAffordUpgrade(currentMoney, cost)) {
        console.error(`Not enough money to buy upgrade ${upgradeId}. Required: ${cost}, Available: ${currentMoney}`);
        return currentMoney;
    }

    incrementAmountOfUpgrades(upgradeId);

    applyUpgradeEffects(upgradeId);

    return cost;
}

function applyUpgradeEffects(upgradeId) {
    if (upgradeId === '1') {
        increaseWordMultiplier(.1);
    } else if (upgradeId === '2') {
        increaseAverageLength(.1);
    } else if (upgradeId === '3') {
        increaseUpgradeCashPerSecond(upgradeId, 10);
    } else if (upgradeId === '4') {
        increaseStreakBonus(1);
    } else if (upgradeId === '5') {
        increaseUpgradeCashPerSecond(upgradeId, 75);
    } else if (upgradeId === '6') {
        increaseUpgradeCashPerSecond(upgradeId, 250);
    }
}