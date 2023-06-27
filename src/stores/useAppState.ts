import { create } from "zustand";

import { IOllieResponse } from "../utils/interfaces";

interface AppState {
    ollieResponses: IOllieResponse[]
    setOllieResponses: (ollieResponse: IOllieResponse[]) => void

    sidePanelOpen: boolean
    setSidePanelOpen: (sidePanelOpen: boolean) => void
}

const useAppState = create<AppState>()((set) => ({
    ollieResponses: [],
    setOllieResponses: (ollieResponses) => set(() => ({ ollieResponses: [...ollieResponses] })),

    sidePanelOpen: true,
    setSidePanelOpen: (sidePanelOpen) => set(() => ({ sidePanelOpen }))
}));

export default useAppState;
