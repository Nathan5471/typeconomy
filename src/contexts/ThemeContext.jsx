import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark');
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const savedTheme = localStorage.getItem('typeconomy-theme') || 'dark';
        setTheme(savedTheme);
        setIsDark(savedTheme === 'dark');
    }, []);

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    const changeTheme = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('typeconomy-theme', newTheme);
        setIsDark(newTheme === 'dark');
    };

    const contextValue = {
        theme,
        isDark,
        changeTheme,
        toggleTheme: () => {
            const newTheme = theme === 'dark' ? 'light' : 'dark';
            changeTheme(newTheme);
        }
    };

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};
