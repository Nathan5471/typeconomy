import React from 'react';
import { useOverlayContext } from '../contexts/OverlayContext.jsx';

export default function Overlay() {
    const { isOverlayOpen, overlayContent } = useOverlayContext();

    if (!isOverlayOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-dark border border-white/10 p-6 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar">
                {overlayContent}
            </div>
        </div>
    )
}