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
        <div className="text-white">
            <h1 className="text-2xl mb-2">Difficulty Settings</h1>
            <p className="text-lg mb-4">Select the difficulty options you want to enable:</p>
            <div className="flex flex-col">
                {options.map((option, index) => (
                <label key={index} className="flex items-center gap-2 mb-2">
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
                    <span className="text-gray-500 peer-checked:text-white w-6 h-6 rounded-full bg-gray-500 peer-checked:bg-[#005828] transition-colors text-center ">✓</span>
                    <span>{option}</span>
                </label>))}
            </div>
            <div className="flex flex-row">
                <button
                    className="bg-[#005828] text-white px-4 py-2 rounded-md mt-4 hover:bg-[#004a1f] transition-colors"
                    onClick={handleSaveDifficulty}
                >
                    Save Difficulty
                </button>
                <button
                    className="bg-[#005828] text-white px-4 py-2 rounded-md mt-4 ml-2 hover:bg-[#004a1f] transition-colors"
                    onClick={handleClose}
                >
                    Close
                </button>
            </div>
        </div>
        
    )
}