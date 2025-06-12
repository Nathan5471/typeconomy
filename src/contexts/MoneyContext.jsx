import { createContext, useContext, useState, useEffect } from 'react';
import { getMoney, increaseMoney, decreaseMoney, calculateWordValue, getTypingTestInformation, updateTypingTestInformation, getLevel, getXP, addXP, checkLevelUp, getXPProgress, calculateWordXP, calculateStreakXPBonus } from '../utils/StorageHandler.js';
import { getWordMultiplier, getAverageLength, getTotalCashPerSecond, getPurchasedOneTimeUpgrades, markOneTimeUpgradeAsPurchased, getDifficulty, changeDifficulty, getUnlockedFeatures, unlockFeature } from '../utils/EffectsHandler.js';
import { getWordsTyped, incrementWordsTyped, getStreak, incrementStreak, clearStreak, getHighestStreak, getAccuracy, addWordToAccuracy, addWordForWPM, calculateWPM, getAverageSessionWPM } from '../utils/StatsHandler.js';

const MoneyContext = createContext();

export const useMoney = () => {
    const context = useContext(MoneyContext);
    return context;
}

export const MoneyProvider = ({ children }) => {
    const [money, setMoney] = useState(0);
    const [wordsTyped, setWordsTyped] = useState(0);
    const [wordsTypedCorrectly, setWordsTypedCorrectly] = useState(0);
    const [wordsTypedIncorrectly, setWordsTypedIncorrectly] = useState(0);
    const [streak, setStreak] = useState(0);
    const [highestStreak, setHighestStreak] = useState(0);
    const [wordMultiplier, setWordMultiplier] = useState(1);
    const [averageLength, setAverageLength] = useState(3);
    const [accuracy, setAccuracy] = useState(100);
    const [wpm, setWPM] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [lastTypingTime, setLastTypingTime] = useState(Date.now());
    const [cashPerSecond, setCashPerSecond] = useState(0);
    const [purchasedOneTimeUpgrades, setPurchasedOneTimeUpgrades] = useState(new Set());
    const [unlockedFeatures, setUnlockedFeatures] = useState(new Set());
    const [difficulty, setDifficulty] = useState({'upper': false, 'numbers': false, 'symbols': false}); // Lowercase is always true
    const [typingTestBoost, setTypingTestBoost] = useState(1);
    const [typingTestBoostActive, setTypingTestBoostActive] = useState(false);
    const [lastTypingTestTime, setLastTypingTestTime] = useState(null);
    // Leveling system states
    const [level, setLevel] = useState(1);
    const [xp, setXP] = useState(0);
    const [xpProgress, setXPProgress] = useState(0);
    const [levelUpNotification, setLevelUpNotification] = useState(false);

    useEffect(() => {
        const storedMoney = getMoney();
        const storedWordsTyped = getWordsTyped();
        const storedStreak = getStreak();
        const storedHighestStreak = getHighestStreak();
        const storedWordMultiplier = getWordMultiplier();
        const storedAverageLength = getAverageLength();
        const [storedAccuracy, storedCorrectWords, storedIncorrectWords] = getAccuracy();
        const storedOneTimeUpgrades = getPurchasedOneTimeUpgrades();
        const storedUnlockedFeatures = getUnlockedFeatures();
        const storedDifficulty = getDifficulty();
        const storedTypingTestInformation = getTypingTestInformation();
        // Load leveling data
        const storedLevel = getLevel();
        const storedXP = getXP();

        if (storedMoney) setMoney(Number(storedMoney));
        if (storedWordsTyped) setWordsTyped(Number(storedWordsTyped));
        if (storedStreak) setStreak(Number(storedStreak));
        if (storedHighestStreak) setHighestStreak(Number(storedHighestStreak));
        if (storedWordMultiplier) setWordMultiplier(storedWordMultiplier);
        if (storedAverageLength) setAverageLength(storedAverageLength);
        if (storedAccuracy) setAccuracy(Number(storedAccuracy));
        if (storedCorrectWords) setWordsTypedCorrectly(Number(storedCorrectWords));
        if (storedIncorrectWords) setWordsTypedIncorrectly(Number(storedIncorrectWords));
        
        // Load average session WPM instead of current WPM
        const avgSessionWPM = getAverageSessionWPM();
        setWPM(avgSessionWPM);
        
        if (storedOneTimeUpgrades) setPurchasedOneTimeUpgrades(new Set(storedOneTimeUpgrades));
        if (storedUnlockedFeatures) setUnlockedFeatures(new Set(storedUnlockedFeatures));
        if (storedDifficulty) setDifficulty(storedDifficulty);
        if (storedLevel) setLevel(Number(storedLevel));
        if (storedXP) {
            setXP(Number(storedXP));
            setXPProgress(getXPProgress(Number(storedXP), Number(storedLevel)));
        }
        if (storedTypingTestInformation) {
            const { typingTestBoost, typingTestBoostIsActive, lastTypingTestTime } = storedTypingTestInformation;
            setTypingTestBoost(typingTestBoost);
            setTypingTestBoostActive(typingTestBoostIsActive);
            setLastTypingTestTime(lastTypingTestTime);
        }
    }, []);

    const handleCorrectWord = (word, isGold) => {
        // Update typing activity timestamp
        setLastTypingTime(Date.now());
        
        setWordsTyped(prev => prev + 1);
        incrementWordsTyped();
        addWordToAccuracy(true);
        
        // Add word for WPM calculation
        addWordForWPM(word.length);
        const newWPM = calculateWPM();
        setWPM(newWPM);
        
        const [newAccuracy, newCorrectWords, newIncorrectWords] = getAccuracy();
        setAccuracy(newAccuracy);
        setWordsTypedCorrectly(newCorrectWords);
        setWordsTypedIncorrectly(newIncorrectWords);
        const wordValue = calculateWordValue(word, isGold, typingTestBoost, typingTestBoostActive);
        increaseMoney(wordValue);
        const newMoney = getMoney();
        setMoney(newMoney);
        
        // Update streak first
        const newStreak = streak + 1;
        setStreak(newStreak);
        incrementStreak();
        
        // Calculate and add XP with streak bonus
        const xpGained = calculateWordXP(word, isGold, newStreak);
        const newXP = addXP(xpGained);
        setXP(newXP);
        
        // Check for level up
        const leveledUp = checkLevelUp(newXP, level);
        if (leveledUp) {
            const newLevel = level + 1;
            setLevel(newLevel);
            setLevelUpNotification(true);
            // Hide level up notification after 3 seconds
            setTimeout(() => setLevelUpNotification(false), 3000);
        }
        
        // Update XP progress
        setXPProgress(getXPProgress(newXP, leveledUp ? level + 1 : level));
    }

    const handleIncorrectWord = () => {
        setWordsTyped(prev => prev + 1);
        incrementWordsTyped();
        addWordToAccuracy(false);
        const [newAccuracy, newCorrectWords, newIncorrectWords] = getAccuracy();
        setAccuracy(newAccuracy);
        setWordsTypedCorrectly(newCorrectWords);
        setWordsTypedIncorrectly(newIncorrectWords);
        setStreak(0);
        clearStreak();
        setHighestStreak(getHighestStreak());
    }

    const decreaseMoneyBy = (amount) => {
        if (amount < 0) {
            console.error('Amount to decrease must be a positive number.');
            return;
        }
        setMoney(prev => Math.max(0, prev - amount));
        decreaseMoney(amount);
        refreshEffects();
    }

    const refreshEffects = () => {
        setWordMultiplier(getWordMultiplier());
        setAverageLength(getAverageLength());
        setCashPerSecond(getTotalCashPerSecond());
    }

    const purchasedOneTimeUpgrade = (upgradeId) => {
        setPurchasedOneTimeUpgrades(prev => new Set(prev).add(upgradeId));
        markOneTimeUpgradeAsPurchased(upgradeId);
        refreshEffects();
    }

    const handleUnlockFeature = (feature) => {
        setUnlockedFeatures(prev => new Set(prev).add(feature));
        unlockFeature(feature);
        refreshEffects();
    }

    const handleChangeDifficulty = (newDifficulty) => {
        if (typeof newDifficulty !== 'object' || newDifficulty === null) {
            console.error('Invalid difficulty object. It must be an object with boolean properties.');
            return;
        }
        if (unlockedFeatures.has('difficulty')) {
            setDifficulty(newDifficulty);
            changeDifficulty(newDifficulty);
        }
    }

    const completeTypingTest = (wpm, accuracy, length) => {
        const boostMultiplier = (wpm / 50) * (length/15) * (accuracy / 100) + 1;
        setTypingTestBoost(boostMultiplier);
        setTypingTestBoostActive(true);
        setLastTypingTestTime(new Date());
        updateTypingTestInformation(boostMultiplier, true, new Date());
        return boostMultiplier;
    }

    useEffect(() => {
        const interval = setInterval(() => {
            const cashPerSecond = getTotalCashPerSecond();
            if (cashPerSecond > 0) {
                increaseMoney(cashPerSecond);
                const newMoney = getMoney();
                setMoney(newMoney);
            }
            setCashPerSecond(cashPerSecond);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Update WPM periodically with idle detection
    useEffect(() => {
        const interval = setInterval(() => {
            // Check if user is actively typing
            const timeSinceLastTyping = Date.now() - lastTypingTime;
            if (timeSinceLastTyping < 3000) {
                // User is actively typing - show current session WPM
                const currentWPM = calculateWPM();
                setWPM(currentWPM);
                setIsTyping(true);
            } else {
                // User is idle - show average session WPM from completed sessions
                const avgSessionWPM = getAverageSessionWPM();
                setWPM(avgSessionWPM);
                setIsTyping(false);
            }
        }, 2000); // Update every 2 seconds
        return () => clearInterval(interval);
    }, [lastTypingTime]);

    useEffect(() => {
        if (!typingTestBoostActive) return;
        setTimeout(() => {
            setTypingTestBoost(1);
            setTypingTestBoostActive(false);
            updateTypingTestInformation(1, false, lastTypingTestTime);
        }, 60000); // Reset boost after 60 seconds
    }, [typingTestBoostActive, lastTypingTestTime]);

    const updateTypingActivity = () => {
        setLastTypingTime(Date.now());
    };

    const contextExport = {
        money,
        wordsTyped,
        wordsTypedCorrectly,
        wordsTypedIncorrectly,
        streak,
        highestStreak,
        wordMultiplier,
        averageLength,
        accuracy,
        wpm,
        isTyping,
        cashPerSecond,
        purchasedOneTimeUpgrades,
        unlockedFeatures,
        difficulty,
        typingTestBoost,
        typingTestBoostActive,
        lastTypingTestTime,
        level,
        xp,
        xpProgress,
        levelUpNotification,
        handleCorrectWord,
        handleIncorrectWord,
        decreaseMoneyBy,
        purchasedOneTimeUpgrade,
        handleUnlockFeature,
        handleChangeDifficulty,
        completeTypingTest,
        updateTypingActivity,
    }

    return (
        <MoneyContext.Provider value={contextExport}>
            {children}
        </MoneyContext.Provider>
    );
}

