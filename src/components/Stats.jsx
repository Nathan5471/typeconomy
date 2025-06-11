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
            <div className="glass-dark rounded-2xl p-6 border border-white/10">
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
                    <span className="mr-3">📊</span>
                    Statistics
                </h2>
                <p className="text-white/60">Track your typing performance</p>
            </div>

            {/* Performance Overview */}
            <div className="glass-dark rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Performance Overview</h3>
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
                                        stroke="rgba(255,255,255,0.1)"
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
                                            <stop offset="0%" stopColor="#3B82F6" />
                                            <stop offset="100%" stopColor="#8B5CF6" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white">{accuracy}%</div>
                                        <div className="text-xs text-white/60">Accuracy</div>
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
                                        stroke="rgba(255,255,255,0.1)"
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
                                            <stop offset="0%" stopColor="#F97316" />
                                            <stop offset="100%" stopColor="#EAB308" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-orange-400">{wpm}</div>
                                        <div className="text-xs text-white/60">WPM</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Leveling Progress */}
            <div className="glass-dark rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">🎯</span>
                    Leveling Progress
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Level Status */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white flex items-center">
                            <span className="mr-2">📊</span>
                            Current Progress
                        </h4>
                        <div className="bg-white/5 rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-white/70">Level</span>
                                <span className="text-yellow-400 font-bold">{level}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-white/70">Total XP</span>
                                <span className="text-cyan-400 font-bold">{xp}</span>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/60">Next Level Progress</span>
                                    <span className="text-white/60">{Math.round(xpProgress)}%</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-3">
                                    <div 
                                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500 animate-glow"
                                        style={{ width: `${xpProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* XP Bonuses Guide */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white flex items-center">
                            <span className="mr-2">🚀</span>
                            XP Bonus System
                        </h4>
                        <div className="space-y-2">
                            <div className="bg-white/5 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-white/70 text-sm">Base XP</span>
                                    <span className="text-blue-400 font-semibold">2 XP per character</span>
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-white/70 text-sm">Gold Words</span>
                                    <span className="text-yellow-400 font-semibold">2x XP Multiplier</span>
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-white/70 text-sm">Streak Bonus</span>
                                    <span className="text-green-400 font-semibold">1.0x - 3.0x XP</span>
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg p-3 border border-cyan-500/20">
                                <div className="text-xs text-cyan-400 font-semibold">
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
                    <div key={index} className="glass-dark rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center text-white font-semibold`}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <div className="text-sm text-white/60">{stat.label}</div>
                                    <div className="text-xl font-bold text-white">{stat.value}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}