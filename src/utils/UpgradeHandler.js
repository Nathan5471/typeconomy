import { getAmountOfUpgrades, incrementAmountOfUpgrades, increaseWordMultiplier, increaseAverageLength, increaseUpgradeCashPerSecond, increaseStreakBonus } from "./StorageHandler";

export function calculateUpgradeCost(baseCost, costMultiplier, upgradeId, amountToBuy, currentMoney) {
    const currentAmount = getAmountOfUpgrades(upgradeId);
    let cost = 0;
    let purchaseAmount = 0;
    if (typeof amountToBuy === 'number') {
        for (let i = 0; i < amountToBuy; i++) {
            cost += Math.floor(baseCost * Math.pow(costMultiplier, currentAmount + i));
        }
        purchaseAmount = amountToBuy;
    } else if (amountToBuy === 'max') {
        console.log(`Calculating max affordable upgrades for ${upgradeId}`);
        let maxAffordable = 0;
        while (true) {
            const nextCost = Math.floor(baseCost * Math.pow(costMultiplier, currentAmount + maxAffordable));
            if (currentMoney >= nextCost + cost) {
                cost += nextCost;
                maxAffordable++;
            } else {
                break;
            }
        }
        purchaseAmount = maxAffordable;
        if (maxAffordable === 0) {
            purchaseAmount = 1;
            cost = Math.floor(baseCost * Math.pow(costMultiplier, currentAmount));
        }
    }
    return [cost, purchaseAmount];
}

export function canAffordUpgrade(money, cost) {
    return money >= cost;
}

export function buyUpgrade(upgradeId, baseCost, costMultiplier, currentMoney, amountToBuy) {
    const [cost, purchaseAmount] = calculateUpgradeCost(baseCost, costMultiplier, upgradeId, amountToBuy, currentMoney);
    if (!canAffordUpgrade(currentMoney, cost)) {
        console.error(`Not enough money to buy upgrade ${upgradeId}. Required: ${cost}, Available: ${currentMoney}`);
        return currentMoney;
    }
    incrementAmountOfUpgrades(upgradeId, purchaseAmount);

    applyUpgradeEffects(upgradeId, purchaseAmount);

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