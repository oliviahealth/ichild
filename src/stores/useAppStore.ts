import { create } from "zustand";
import { v4 as uuid } from "uuid";

import { IConversation, IAPIResponse } from "../utils/interfaces";

interface AppState {
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
    addQueryToConversation: (id: string, response: IAPIResponse) => void,
    switchConversation: (id: string) => void
    createNewConversation: () => void
    deleteConversation: (id: string) => void,
    
    // Determine if a conversation is outdated. A conversation is considered outdated if the last time it was accessed is 30+ days ago
    isConversationOutdated: (id: string) => boolean,

    currentConversationId: string | null,
}

const useAppStore = create<AppState>()((set, get) => ({
    isSidePanelOpen: true,
    setisSidePanelOpen: (isSidePanelOpen) => set(() => ({ isSidePanelOpen })),

    apiResponses: [],
    setApiResponses: (apiResponses) => set(() => ({ apiResponses: [...apiResponses] })),

    conversations: JSON.parse(localStorage.getItem("conversations") ?? "[]"),
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
            created: new Date(),
            lastAccessed: new Date(),
            responses: [response],
        };

        return {
            conversations: [newConversation, ...state.conversations],
            currentConversationId: id
        };
    }),
    switchConversation: (id) => set((state) => {
        const conversation = state.conversations.find(elm => elm.id === id)!;

        const updatedConversation = state.conversations.map((conversation) => conversation.id === id ? { ...conversation, lastAccessed: new Date() } : conversation)

        return { apiResponses: conversation.responses, currentConversationId: id, conversations: updatedConversation }
    }),
    createNewConversation: () => set(() => ({ apiResponses: [], currentConversationId: uuid() })),
    deleteConversation: (id) => set((state) => {
        const newConversations = state.conversations.filter(conversation => conversation.id !== id);

        const newCurrentConversation = newConversations[0];

        // Create a new conversation if there are no more conversations
        if(!newCurrentConversation) {
            state.createNewConversation();
            return { conversations: newConversations }
        }

        return { conversations: newConversations, apiResponses: newCurrentConversation.responses, currentConversationId: newCurrentConversation.id };
    }),
    isConversationOutdated: (id) => {
        const conversation = get().conversations.find(elm => elm.id === id)!;

        const lastAccessedDate = new Date(conversation.lastAccessed);
        const currentDate = new Date();

        // Calculate the difference in milliseconds between the current date and the last accessed date
        const timeDifference = currentDate.getTime() - lastAccessedDate.getTime();

        // Calculate the number of days
        const daysDifference = timeDifference / (1000 * 3600 * 24);

        // Conversation is outdated if it was last accessed over 30 days ago
        if(daysDifference > 30) return true

        return false
    },

    currentConversationId: null,
}));

export default useAppStore;
