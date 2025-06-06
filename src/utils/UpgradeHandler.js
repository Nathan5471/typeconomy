import { getAmountOfUpgrades, incrementAmountOfUpgrades, increaseWordMultiplier, increaseAverageLength, increaseUpgradeCashPerSecond, increaseStreakBonus } from "./StorageHandler";

export function calculateUpgradeCost(baseCost, costMultiplier, upgradeId, amountToBuy) {
    const amount = getAmountOfUpgrades(upgradeId);
    let cost = 0;
    for (let i = 0; i < amountToBuy; i++) {
        cost += Math.floor(baseCost * Math.pow(costMultiplier, amount + i));
    }
    return cost;
}

export function canAffordUpgrade(money, cost) {
    return money >= cost;
}

export function buyUpgrade(upgradeId, baseCost, costMultiplier, currentMoney, amountToBuy) {
    const cost = calculateUpgradeCost(baseCost, costMultiplier, upgradeId, amountToBuy);
    if (!canAffordUpgrade(currentMoney, cost)) {
        console.error(`Not enough money to buy upgrade ${upgradeId}. Required: ${cost}, Available: ${currentMoney}`);
        return currentMoney;
    }
    incrementAmountOfUpgrades(upgradeId, amountToBuy);

    applyUpgradeEffects(upgradeId, amountToBuy);

    return cost;
}

function applyUpgradeEffects(upgradeId, amount) {
    console.log(`Applying effects for upgrade ${upgradeId} with amount ${amount}`);
    if (upgradeId === '1') {
        increaseAverageLength(.1 * amount);
    } else if (upgradeId === '2') {
        increaseWordMultiplier(.1 * amount);
    } else if (upgradeId === '3') {
        increaseUpgradeCashPerSecond(upgradeId, 10 * amount);
    } else if (upgradeId === '4') {
        increaseStreakBonus(1 * amount);
    } else if (upgradeId === '5') {
        increaseUpgradeCashPerSecond(upgradeId, 75 * amount);
    } else if (upgradeId === '6') {
        increaseUpgradeCashPerSecond(upgradeId, 250 * amount);
    }
}