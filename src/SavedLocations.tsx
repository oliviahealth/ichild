import React from "react";

import useAppStore from "./stores/useAppStore";

import { TfiMenuAlt } from "react-icons/tfi";

const SavedLocations: React.FC = () => {
    const isSidePanelOpen = useAppStore((state) => state.isSidePanelOpen);
    const setisSidePanelOpen = useAppStore((state) => state.setisSidePanelOpen);

    return (
        <div className="flex w-full flex-col h-full">
            {!isSidePanelOpen && (
                <button className="drawer-content absolute btn w-12 m-3 btn-primary btn-outline border-primary bg-white z-10" onClick={() => setisSidePanelOpen(!isSidePanelOpen)}>
                    <TfiMenuAlt className="text-lg" />
                </button>
            )}
        </div>
    )
}

export default SavedLocations;