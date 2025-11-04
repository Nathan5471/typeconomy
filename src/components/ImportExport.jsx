import React, { useState } from 'react';
import { importSaveFile, exportSaveFile } from '../utils/StorageHandler.js';
import { useOverlayContext } from '../contexts/OverlayContext.jsx';

export default function ImportExport() {
    const { closeOverlay } = useOverlayContext();
    const [saveData, setSaveData] = useState(null);

    const handleFileInput = (e) => {
        console.log('File input changed:', e.target.files);
        e.preventDefault();
        const file = e.target.files[0];
        console.log('Selected file:', file);
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const saveData = JSON.parse(event.target.result);
                    setSaveData(saveData);
                    console.log('Save data loaded:', saveData);
                } catch (error) {
                    console.error('Error parsing save file:', error);
                    alert('Invalid save file format. Please upload a valid JSON file.');
                }
            }
            reader.readAsText(file);
        }
    }

    const handleImport = (e) => {
        e.preventDefault();
        if (saveData === null) {
            alert('Please select a file to import.');
            return;
        }
        importSaveFile(saveData)
            .then(() => {
                closeOverlay();
            })
            .catch((error) => {
                console.error('Error importing save file:', error);
                alert('Failed to import save file. Please check the console for details.');
            });
    }

    const handleExport = (e) => {
        e.preventDefault();
        exportSaveFile()
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
                    <span className="mr-3"></span>
                    Import/Export Game Data
                </h1>
                <p className="text-white/70">Backup or restore your game progress</p>
            </div>
            
            <div className="glass-dark rounded-2xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2"></span>
                    Import Save Data
                </h2>
                <div className="space-y-4">
                    <div className="relative">
                        <input 
                            type="file" 
                            accept=".json" 
                            onChange={handleFileInput} 
                            className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500/20 file:text-blue-400 file:hover:bg-blue-500/30 file:transition-all file:duration-300 hover:bg-white/10 transition-all duration-300"
                        />
                    </div>
                    <button 
                        className="w-full glass-dark border border-blue-500/30 text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10 px-6 py-3 rounded-2xl font-medium transition-all duration-300" 
                        onClick={handleImport}
                    >
                        Import Game Data
                    </button>
                </div>
            </div>
            
            <div className="glass-dark rounded-2xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2"></span>
                    Export Save Data
                </h2>
                <button 
                    className="w-full glass-dark border border-green-500/30 text-green-400 hover:border-green-500/50 hover:bg-green-500/10 px-6 py-3 rounded-2xl font-medium transition-all duration-300" 
                    onClick={handleExport}
                >
                    Download Save File
                </button>
            </div>
            
            <button 
                className="w-full glass-dark border border-gray-500/30 text-gray-400 hover:border-gray-500/50 hover:bg-gray-500/10 px-6 py-3 rounded-2xl font-medium transition-all duration-300" 
                onClick={handleClose}
            >
                Cancel
            </button>
        </div>
    )
}
