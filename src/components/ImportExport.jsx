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
        <div className="text-white">
            <h1 className="text-4xl">Import/Export Game Data</h1>
            <h2 className="text-2xl mb-2">Import</h2>
            <div className="flex flex-col">
                <input type="file" accept=".json" onChange={handleFileInput} className="p-2 file:bg-[#005828] file:text-white file:px-4 file:py-2 file:border-none file:rounded-md"/>
                <button className="mt-2 bg-[#005828] text-white p-2 rounded" onClick={handleImport}>Import</button>
            </div>
            <h2 className="text-2xl">Export</h2>
            <button className="mt-2 bg-[#005828] text-white p-2 rounded w-full" onClick={handleExport}>Export</button>
            <button className="mt-2 bg-[#005828] text-white p-2 rounded w-full" onClick={handleClose}>Cancel</button>
        </div>
    )
}