import React from 'react';
import FormatMoney from '../utils/FormatMoney.js';

export default function SessionSummary({ sessionStats, onClose }) {
    const { duration, wordsTyped, moneyEarned, avgWPM, accuracy, streak } = sessionStats;
    
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    
    const getPerformanceRating = () => {
        const score = (avgWPM * 0.4) + (accuracy * 0.4) + (streak * 0.2);
        if (score >= 80) return { rating: 'Exceptional', color: 'var(--accent-purple)' };
        if (score >= 65) return { rating: 'Excellent', color: 'var(--accent-yellow)' };
        if (score >= 50) return { rating: 'Great', color: 'var(--accent-green)' };
        if (score >= 35) return { rating: 'Good', color: 'var(--accent-blue)' };
        return { rating: 'Keep Practicing', color: 'var(--accent-orange)' };
    };
    
    const performance = getPerformanceRating();
    
    return (
        <div className="text-white space-y-6">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center">
                    <span className="mr-3">🏁</span>
                    Session Complete!
                </h1>
                <div className="flex items-center justify-center space-x-2 text-lg">
                    <span style={{ color: performance.color }}>{performance.icon}</span>
                    <span style={{ color: performance.color }}>{performance.rating}</span>
                </div>
            </div>
            
            {/* Main Stats Grid */}
            <div className="glass-dark rounded-2xl p-6 border border-white/10">
                <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-400 mb-2">{wordsTyped}</div>
                        <div className="text-white/70 text-sm">Words Typed</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-green-400 mb-2">{FormatMoney(moneyEarned)}</div>
                        <div className="text-white/70 text-sm">Money Earned</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-orange-400 mb-2">{avgWPM}</div>
                        <div className="text-white/70 text-sm">Average WPM</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400 mb-2">{formatTime(duration)}</div>
                        <div className="text-white/70 text-sm">Duration</div>
                    </div>
                </div>
            </div>
            
            {/* Performance Metrics */}
            <div className="glass-dark rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 text-center">Performance Breakdown</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-white/70">Session Accuracy</span>
                        <span className="text-green-400 font-semibold">{accuracy.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-white/70">Peak Streak</span>
                        <span className="text-cyan-400 font-semibold">{streak} words</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-white/70">Characters Typed</span>
                        <span className="text-blue-400 font-semibold">{wordsTyped * 5}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-white/70">Money per Word</span>
                        <span className="text-yellow-400 font-semibold">{FormatMoney(moneyEarned / Math.max(wordsTyped, 1))}</span>
                    </div>
                </div>
            </div>
            
            {/* Achievement Badges */}
            {(avgWPM >= 60 || accuracy >= 95 || streak >= 25) && (
                <div className="glass-dark rounded-2xl p-6 border border-yellow-500/30">
                    <h3 className="text-lg font-semibold text-yellow-400 mb-4 text-center">Session Achievements</h3>
                    <div className="flex flex-wrap justify-center gap-2">
                        {avgWPM >= 60 && (
                            <div className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-400 text-sm">
                                Speed Demon (60+ WPM)
                            </div>
                        )}
                        {accuracy >= 95 && (
                            <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-sm">
                                Precision Master (95%+ Accuracy)
                            </div>
                        )}
                        {streak >= 25 && (
                            <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-sm">
                                Streak Legend (25+ Words)
                            </div>
                        )}
                        {avgWPM >= 80 && (
                            <div className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-400 text-sm">
                                Typing Rocket (80+ WPM)
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            <button
                onClick={onClose}
                className="w-full glass-dark border border-blue-500/30 text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10 px-6 py-3 rounded-2xl font-medium transition-all duration-300"
            >
                Continue Typing
            </button>
        </div>
    );
}
