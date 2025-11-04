import React from 'react';
import { useTheme } from '../contexts/ThemeContext.jsx';

export default function ThemeToggle() {
    const { theme, isDark, changeTheme } = useTheme();

    const themeOptions = [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' }
    ];

    return (
        <div className="relative">
            <div className="flex items-center space-x-2 glass rounded-xl p-2" 
                 style={{ 
                     background: 'var(--glass-bg)', 
                     borderColor: 'var(--border-primary)' 
                 }}>
                {themeOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => changeTheme(option.value)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative"
                        style={{
                            backgroundColor: theme === option.value ? 'var(--glass-border)' : 'transparent',
                            color: theme === option.value ? 'var(--text-primary)' : 'var(--text-secondary)',
                            boxShadow: theme === option.value ? `0 4px 6px -1px var(--shadow-color)` : 'none'
                        }}
                        aria-label={`Switch to ${option.label} theme`}
                    >
                        <span className="text-base">{option.icon}</span>
                        <span className="hidden sm:inline">{option.label}</span>
                        
                        {/* Active indicator */}
                        {theme === option.value && (
                            <div className="absolute inset-0 rounded-lg animate-pulse gradient-bg" 
                                 style={{ opacity: '0.2' }}></div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
