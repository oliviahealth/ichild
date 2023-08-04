import { create } from "zustand";
import { v4 as uuid } from "uuid";

import { IConversation, IAPIResponse, IUser } from "../utils/interfaces";

interface AppState {
    user: IUser | null
    setUser: (user: IUser | null) => void
    
    isSidePanelOpen: boolean
    setisSidePanelOpen: (isSidePanelOpen: boolean) => void

    apiResponses: IAPIResponse[]
    setApiResponses: (apiResponse: IAPIResponse[]) => void

    /*
       The conversations array is used to create the side panel of recent chats similar to chat-gpt's side panel.
       The conversations array holds objects of the type: IConversation, which represents the complete dialogue between the user and the api during the current session
       When a user submits a query and the api responds, we update the conversations array by adding the new response to the current conversation object
       When the user exists the app, we hold this conversation in local storage memory
   */
    conversations: IConversation[]
    setConversations: (conversations: IConversation[]) => void
    addQueryToConversation: (id: string, response: IAPIResponse) => void,
    switchConversation: (id: string) => void
    createNewConversation: () => void
    removeConversation: (id: string) => void,
    
    currentConversationId: string | null,
    setCurrentConversationId: (conversationId: string) => void
}

const useAppStore = create<AppState>()((set, get) => ({
    user: null,
    setUser: (user) => set(() => ({ user })),

    isSidePanelOpen: true,
    setisSidePanelOpen: (isSidePanelOpen) => set(() => ({ isSidePanelOpen })),

    apiResponses: [],
    setApiResponses: (apiResponses) => set(() => ({ apiResponses: [...apiResponses] })),

    conversations: JSON.parse(localStorage.getItem("conversations") ?? "[]"),
    setConversations: (conversations) => set(() => ({ conversations })),
    addQueryToConversation: (id, response) => set((state) => {
        const conversationIndex = state.conversations.findIndex(conversation => conversation.id === id);
    
        if (conversationIndex !== -1) {
            // Conversation exists
            const conversations = [...state.conversations];
            const updatedConversation = {...conversations[conversationIndex]};
            updatedConversation.responses.push(response);
            
            // Move the updated conversation to the top of the conversations array
            conversations.splice(conversationIndex, 1);
            conversations.unshift(updatedConversation);
    
            return { conversations };
        }

        // Conversation doesn't exist
        const newConversation = {
            title: response.userQuery,
            id,
            responses: [response],
            userId: get().user!.id
        };

        return {
            conversations: [newConversation, ...state.conversations],
            currentConversationId: id
        };
    }),
    switchConversation: (id) => set((state) => {
        const conversation = state.conversations.find(elm => elm.id === id)!;

        return { apiResponses: conversation.responses, currentConversationId: id }
    }),
    createNewConversation: () => set(() => {
        
        
        return { apiResponses: [], currentConversationId: uuid() }
    }),
    removeConversation: (id) => set((state) => {
        const newConversations = state.conversations.filter(conversation => conversation.id !== id);

        const newCurrentConversation = newConversations[0];

        // Create a new conversation if there are no more conversations
        if(!newCurrentConversation) {
            state.createNewConversation();
            return { conversations: newConversations }
        }

        return { conversations: newConversations, apiResponses: newCurrentConversation.responses, currentConversationId: newCurrentConversation.id };
    }),
    
    currentConversationId: null,
    setCurrentConversationId: (currentConversationId => set({ currentConversationId }))
}));

export default useAppStore;
