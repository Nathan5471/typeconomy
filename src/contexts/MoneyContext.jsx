import { createContext, useContext, useState, useEffect } from 'react';
import { getMoney, increaseMoney, getWordsTyped, incrementWordsType, getStreak, incrementStreak, clearStreak, calculateWordValue } from '../utils/StorageHandler';

const MoneyContext = createContext();

export const useMoney = () => {
    const context = useContext(MoneyContext);
    return context;
}

export const MoneyProvider = ({ children }) => {
    const [money, setMoney] = useState(0);
    const [wordsTyped, setWordsTyped] = useState(0);
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        const storedMoney = getMoney();
        const storedWordsTyped = getWordsTyped();
        const storedStreak = getStreak();

        if (storedMoney) setMoney(Number(storedMoney));
        if (storedWordsTyped) setWordsTyped(Number(storedWordsTyped));
        if (storedStreak) setStreak(Number(storedStreak));
    }, []);

    const incrementWordsTyped = (word) => {
        setWordsTyped(prev => prev + 1);
        incrementWordsType();
        const wordValue = calculateWordValue(word);
        increaseMoney(wordValue);
        const newMoney = getMoney();
        setMoney(newMoney);
    }

    const increaseStreak = () => {
        setStreak(prev => prev + 1);
        incrementStreak();
    }
    
    const resetStreak = () => {
        setStreak(0);
        clearStreak();
    }

    const contextExport = {
        money,
        wordsTyped,
        streak,
        incrementWordsTyped,
        increaseStreak,
        resetStreak,
    }

    return (
        <MoneyContext.Provider value={contextExport}>
            {children}
        </MoneyContext.Provider>
    );
}

