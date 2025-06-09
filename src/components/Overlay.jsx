import React from 'react';
import { useOverlayContext } from '../contexts/OverlayContext.jsx';

export default function Overlay() {
    const { isOverlayOpen, overlayContent } = useOverlayContext();

    if (!isOverlayOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#f0f0f0] p-4 rounded-lg shadow-lg max-w-md w-full">
                {overlayContent}
            </div>
        </div>
    )
}