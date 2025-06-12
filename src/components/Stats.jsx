import React from 'react';
import { useMoney } from '../contexts/MoneyContext';
import FormatMoney from '../utils/FormatMoney.js';

export default function Stats() {
    const { wordsTyped, wordsTypedCorrectly, wordsTypedIncorrectly, highestStreak, level, xp, xpProgress, wpm } = useMoney();

    const stats = [
        { label: 'Words Typed', value: wordsTyped, icon: '⌨️', color: 'from-blue-500 to-cyan-500' },
        { label: 'Correct Words', value: wordsTypedCorrectly, icon: '✅', color: 'from-green-500 to-emerald-500' },
        { label: 'Incorrect Words', value: wordsTypedIncorrectly, icon: '❌', color: 'from-red-500 to-rose-500' },
        { label: 'Highest Streak', value: highestStreak, icon: '🔥', color: 'from-orange-500 to-yellow-500' },
        { label: 'Current Level', value: level, icon: '⭐', color: 'from-yellow-500 to-orange-500' },
        { label: 'Total XP', value: xp, icon: '🚀', color: 'from-cyan-500 to-blue-500' },
    ];

    const accuracy = wordsTyped > 0 ? Math.round((wordsTypedCorrectly / wordsTyped) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass rounded-2xl p-6" 
                 style={{ 
                     background: 'var(--glass-bg)', 
                     borderColor: 'var(--border-primary)' 
                 }}>
                <h2 className="text-3xl font-bold mb-2 flex items-center" 
                    style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-3">📊</span>
                    Statistics
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>Track your typing performance</p>
            </div>

            {/* Performance Overview */}
            <div className="glass rounded-2xl p-6" 
                 style={{ 
                     background: 'var(--glass-bg)', 
                     borderColor: 'var(--border-primary)' 
                 }}>
                <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Performance Overview</h3>
                <div className="space-y-4">
                    {/* Performance Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Accuracy Circle */}
                        <div className="flex items-center justify-center">
                            <div className="relative w-32 h-32">
                                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                                    <circle
                                        cx="60"
                                        cy="60"
                                        r="50"
                                        stroke="var(--border-primary)"
                                        strokeWidth="8"
                                        fill="none"
                                    />
                                    <circle
                                        cx="60"
                                        cy="60"
                                        r="50"
                                        stroke="url(#gradient-accuracy)"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={`${(accuracy / 100) * 314} 314`}
                                        className="transition-all duration-1000"
                                    />
                                    <defs>
                                        <linearGradient id="gradient-accuracy" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="var(--accent-blue)" />
                                            <stop offset="100%" stopColor="var(--accent-purple)" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{accuracy}%</div>
                                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Accuracy</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* WPM Display */}
                        <div className="flex items-center justify-center">
                            <div className="relative w-32 h-32">
                                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                                    <circle
                                        cx="60"
                                        cy="60"
                                        r="50"
                                        stroke="var(--border-primary)"
                                        strokeWidth="8"
                                        fill="none"
                                    />
                                    <circle
                                        cx="60"
                                        cy="60"
                                        r="50"
                                        stroke="url(#gradient-wpm)"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={`${Math.min(wpm / 100, 1) * 314} 314`}
                                        className="transition-all duration-1000"
                                    />
                                    <defs>
                                        <linearGradient id="gradient-wpm" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="var(--accent-orange)" />
                                            <stop offset="100%" stopColor="var(--accent-yellow)" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold" style={{ color: 'var(--accent-orange)' }}>{wpm}</div>
                                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>WPM</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Leveling Progress */}
            <div className="glass rounded-2xl p-6" 
                 style={{ 
                     background: 'var(--glass-bg)', 
                     borderColor: 'var(--border-primary)' 
                 }}>
                <h3 className="text-xl font-semibold mb-4 flex items-center" 
                    style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">🎯</span>
                    Leveling Progress
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Level Status */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold flex items-center" 
                            style={{ color: 'var(--text-primary)' }}>
                            <span className="mr-2">📊</span>
                            Current Progress
                        </h4>
                        <div className="rounded-lg p-4 space-y-3" 
                             style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                            <div className="flex items-center justify-between">
                                <span style={{ color: 'var(--text-secondary)' }}>Level</span>
                                <span className="font-bold" style={{ color: 'var(--accent-yellow)' }}>{level}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span style={{ color: 'var(--text-secondary)' }}>Total XP</span>
                                <span className="font-bold" style={{ color: 'var(--accent-cyan)' }}>{xp}</span>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: 'var(--text-muted)' }}>Next Level Progress</span>
                                    <span style={{ color: 'var(--text-muted)' }}>{Math.round(xpProgress)}%</span>
                                </div>
                                <div className="w-full rounded-full h-3" 
                                     style={{ backgroundColor: 'var(--border-primary)' }}>
                                    <div 
                                        className="h-3 rounded-full transition-all duration-500 animate-glow gradient-bg-alt"
                                        style={{ width: `${xpProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* XP Bonuses Guide */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold flex items-center" 
                            style={{ color: 'var(--text-primary)' }}>
                            <span className="mr-2">🚀</span>
                            XP Bonus System
                        </h4>
                        <div className="space-y-2">
                            <div className="rounded-lg p-3" 
                                 style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Base XP</span>
                                    <span className="font-semibold" style={{ color: 'var(--accent-blue)' }}>2 XP per character</span>
                                </div>
                            </div>
                            <div className="rounded-lg p-3" 
                                 style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Gold Words</span>
                                    <span className="font-semibold" style={{ color: 'var(--accent-yellow)' }}>2x XP Multiplier</span>
                                </div>
                            </div>
                            <div className="rounded-lg p-3" 
                                 style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Streak Bonus</span>
                                    <span className="font-semibold" style={{ color: 'var(--accent-green)' }}>1.0x - 3.0x XP</span>
                                </div>
                            </div>
                            <div className="rounded-lg p-3" 
                                 style={{ 
                                     background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))', 
                                     opacity: '0.1',
                                     borderColor: 'var(--accent-cyan)' 
                                 }}>
                                <div className="text-xs font-semibold" style={{ color: 'var(--accent-cyan)' }}>
                                    💡 Tip: Maintain long streaks for maximum XP gains!
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="glass rounded-xl p-4 transition-all duration-300" 
                         style={{ 
                             background: 'var(--glass-bg)', 
                             borderColor: 'var(--border-primary)' 
                         }}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center text-white font-semibold`}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
                                    <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}