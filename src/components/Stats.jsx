import React from 'react';
import { useMoney } from '../contexts/MoneyContext';
import FormatMoney from '../utils/FormatMoney.js';

export default function Stats() {
    const { wordsTyped, wordsTypedCorrectly, wordsTypedIncorrectly, highestStreak, cashPerSecond } = useMoney();

    const stats = [
        { label: 'Words Typed', value: wordsTyped, icon: '⌨️', color: 'from-blue-500 to-cyan-500' },
        { label: 'Correct Words', value: wordsTypedCorrectly, icon: '✅', color: 'from-green-500 to-emerald-500' },
        { label: 'Incorrect Words', value: wordsTypedIncorrectly, icon: '❌', color: 'from-red-500 to-rose-500' },
        { label: 'Highest Streak', value: highestStreak, icon: '🔥', color: 'from-orange-500 to-yellow-500' },
        { label: 'Cash Per Second', value: FormatMoney(cashPerSecond), icon: '💰', color: 'from-purple-500 to-pink-500' },
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

            {/* Quick Actions */}
            <div className="glass-dark rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                    <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2">
                        <span>🎯</span>
                        <span>Practice Mode</span>
                    </button>
                    <button className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2">
                        <span>📈</span>
                        <span>View History</span>
                    </button>
                </div>
            </div>
        </div>
    );
}