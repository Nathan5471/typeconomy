import {createContext, useState, useContext} from 'react';

const OverlayContext = createContext();

export const useOverlayContext = () => useContext(OverlayContext);
    
export const OverlayProvider =({children}) => {
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const [overlayContent, setOverlayContent] = useState(null);

    const openOverlay = (content) => {
        setOverlayContent(content);
        setIsOverlayOpen(true);
    }

    const closeOverlay = () => {
        setOverlayContent(null);
        setIsOverlayOpen(false);
    }

    const contextValue = {
        isOverlayOpen,
        overlayContent,
        openOverlay,
        closeOverlay
    }

    return <OverlayContext.Provider value={contextValue}>
        {children}
    </OverlayContext.Provider>
}