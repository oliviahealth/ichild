import { create } from "zustand";

import { IUser, IConversationPreview } from "../utils/interfaces";

interface AppState {
    user: IUser | null
    setUser: (user: IUser | null) => void

    accessToken: string | null
    setAccessToken: (accessToken: string | null) => void

    isSidePanelOpen: boolean
    setisSidePanelOpen: (isSidePanelOpen: boolean) => void

    currentConversationId: string | null
    setCurrentConversationId: (conversationId: string | null) => void

    conversationPreviews: IConversationPreview[]
    setConversationPreviews: (conversationDetail: IConversationPreview[]) => void

    error: string | null,
    setError: (error: string | null) => void

    copyText: (text: string) => void
}

const useAppStore = create<AppState>()((set) => ({
    user: null,
    setUser: (user) => set(() => ({ user })),

    accessToken: null,
    setAccessToken: (accessToken) => set(() => ({ accessToken })),

    isSidePanelOpen: true,
    setisSidePanelOpen: (isSidePanelOpen) => set(() => ({ isSidePanelOpen })),

    currentConversationId: null,
    setCurrentConversationId: (currentConversationId => set({ currentConversationId })),

    conversationPreviews: [],
    setConversationPreviews: (conversationDetails) => set({ conversationPreviews: conversationDetails }),

    error: null,
    setError: (error => set({ error })),

    copyText: (text) => {
        navigator.clipboard.writeText(text);
    }
}));

export default useAppStore;
