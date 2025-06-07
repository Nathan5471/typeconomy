import { createContext, useContext, useState, useEffect } from 'react';
import { getMoney, increaseMoney, decreaseMoney, getWordsTyped, incrementWordsType, getStreak, incrementStreak, clearStreak, getHighestStreak, getWordMultiplier, getAverageLength, getAccuracy, addWordToAccuracy, getTotalCashPerSecond, calculateWordValue } from '../utils/StorageHandler';

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
    const [cashPerSecond, setCashPerSecond] = useState(0);

    useEffect(() => {
        const storedMoney = getMoney();
        const storedWordsTyped = getWordsTyped();
        const storedStreak = getStreak();
        const storedHighestStreak = getHighestStreak();
        const storedWordMultiplier = getWordMultiplier();
        const storedAverageLength = getAverageLength();
        const [storedAccuracy, storedCorrectWords, storedIncorrectWords] = getAccuracy();

        if (storedMoney) setMoney(Number(storedMoney));
        if (storedWordsTyped) setWordsTyped(Number(storedWordsTyped));
        if (storedStreak) setStreak(Number(storedStreak));
        if (storedHighestStreak) setHighestStreak(Number(storedHighestStreak));
        if (storedWordMultiplier) setWordMultiplier(storedWordMultiplier);
        if (storedAverageLength) setAverageLength(storedAverageLength);
        if (storedAccuracy) setAccuracy(Number(storedAccuracy));
        if (storedCorrectWords) setWordsTypedCorrectly(Number(storedCorrectWords));
        if (storedIncorrectWords) setWordsTypedIncorrectly(Number(storedIncorrectWords));
    }, []);

    const handleCorrectWord = (word, isGold) => {
        setWordsTyped(prev => prev + 1);
        incrementWordsType();
        addWordToAccuracy(true);
        const [newAccuracy, newCorrectWords, newIncorrectWords] = getAccuracy();
        setAccuracy(newAccuracy);
        setWordsTypedCorrectly(newCorrectWords);
        setWordsTypedIncorrectly(newIncorrectWords);
        const wordValue = calculateWordValue(word, isGold);
        increaseMoney(wordValue);
        const newMoney = getMoney();
        setMoney(newMoney);
        setStreak(prev => prev + 1);
        incrementStreak();
    }

    const handleIncorrectWord = () => {
        setWordsTyped(prev => prev + 1);
        incrementWordsType();
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
        cashPerSecond,
        handleCorrectWord,
        handleIncorrectWord,
        decreaseMoneyBy,
    }

    return (
        <MoneyContext.Provider value={contextExport}>
            {children}
        </MoneyContext.Provider>
    );
}

