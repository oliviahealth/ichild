import { create } from "zustand";

import { IUser, IConversationDetail } from "../utils/interfaces";

interface AppState {
    user: IUser | null
    setUser: (user: IUser | null) => void
    
    isSidePanelOpen: boolean
    setisSidePanelOpen: (isSidePanelOpen: boolean) => void

    currentConversationId: string | null
    setCurrentConversationId: (conversationId: string | null) => void

    conversationDetails: IConversationDetail[]
    setConversationDetails: (conversationDetail: IConversationDetail[]) => void

    error: string | null,
    setError: (error: string | null) => void
}

const useAppStore = create<AppState>()((set) => ({
    user: null,
    setUser: (user) => set(() => ({ user })),

    isSidePanelOpen: true,
    setisSidePanelOpen: (isSidePanelOpen) => set(() => ({ isSidePanelOpen })),

    currentConversationId: null,
    setCurrentConversationId: (currentConversationId => set({ currentConversationId })),

    conversationDetails: [],
    setConversationDetails: (conversationDetails) => set({ conversationDetails }),

    error: null,
    setError: (error => set({ error })),
}));

export default useAppStore;
