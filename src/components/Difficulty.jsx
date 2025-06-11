import React from 'react';
import { useMoney } from '../contexts/MoneyContext';
import { useOverlayContext } from '../contexts/OverlayContext';

export default function Difficulty() {
    const { difficulty, handleChangeDifficulty } = useMoney();
    const { closeOverlay } = useOverlayContext();
    const selectedDifficulty = difficulty;
    const options = ['upper', 'numbers', 'symbols'];

    const handleSelectDifficulty = (e) => {
        const { value, checked } = e.target;
        selectedDifficulty[value] = checked;
    }

    const handleSaveDifficulty = (e) => {
        e.preventDefault();
        handleChangeDifficulty(selectedDifficulty);
        closeOverlay();
    }

    const handleClose = (e) => {
        e.preventDefault();
        closeOverlay();
    }

    return (
        <div className="text-white space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center">
                    <span className="mr-3">⚙️</span>
                    Difficulty Settings
                </h1>
                <p className="text-white/70">Select the difficulty options you want to enable:</p>
            </div>
            
            <div className="glass-dark rounded-2xl p-6 border border-white/10">
                <div className="space-y-4">
                    {options.map((option, index) => (
                    <label key={index} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer">
                        <input
                            type="checkbox"
                            name="difficulty"
                            className="peer hidden"
                            value={option}
                            defaultChecked={selectedDifficulty[option]}
                            onChange={(e) => {
                                handleSelectDifficulty(e);
                            }}
                        />
                        <div className="w-6 h-6 rounded-full border-2 border-white/30 peer-checked:border-orange-500 peer-checked:bg-orange-500/20 transition-all duration-300 flex items-center justify-center">
                            <span className="text-orange-400 opacity-0 peer-checked:opacity-100 transition-opacity duration-300">✓</span>
                        </div>
                        <span className="text-white font-medium capitalize">{option}</span>
                    </label>))}
                </div>
            </div>
            
            <div className="flex gap-3">
                <button
                    className="flex-1 glass-dark border border-orange-500/30 text-orange-400 hover:border-orange-500/50 hover:bg-orange-500/10 px-6 py-3 rounded-2xl font-medium transition-all duration-300"
                    onClick={handleSaveDifficulty}
                >
                    Save Settings
                </button>
                <button
                    className="flex-1 glass-dark border border-gray-500/30 text-gray-400 hover:border-gray-500/50 hover:bg-gray-500/10 px-6 py-3 rounded-2xl font-medium transition-all duration-300"
                    onClick={handleClose}
                >
                    Cancel
                </button>
            </div>
        </div>
        
    )
}