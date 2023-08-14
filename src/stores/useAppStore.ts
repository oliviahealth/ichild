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
    addApiResponseToConversation: (id: string, response: IAPIResponse) => void,
    switchConversation: (id: string) => void
    createNewConversation: () => void
    removeConversation: (id: string) => void,
    
    currentConversationId: string | null,
    setCurrentConversationId: (conversationId: string | null) => void

    error: string | null,
    setError: (error: string | null) => void
}

const useAppStore = create<AppState>()((set, get) => ({
    user: null,
    setUser: (user) => set(() => ({ user })),

    isSidePanelOpen: true,
    setisSidePanelOpen: (isSidePanelOpen) => set(() => ({ isSidePanelOpen })),

    apiResponses: [],
    setApiResponses: (apiResponses) => set(() => ({ apiResponses: [...apiResponses] })),

    conversations: JSON.parse("[]"),
    setConversations: (conversations) => set(() => ({ conversations })),
    addApiResponseToConversation: (id, response) => set((state) => {
        const conversation = state.conversations.find(conversation => conversation.id === id);
    
        if (conversation) {
            // Conversation exists
            const conversations = [...state.conversations];
            const updatedConversation = {...conversation};
            updatedConversation.responses.push(response);
            
            // Move the updated conversation to the top of the conversations array
            conversations.splice(state.conversations.indexOf(conversation), 1);
            conversations.unshift(updatedConversation);
    
            return { conversations };
        }

        // Conversation doesn't exist
        const newConversation = {
            title: response.userQuery,
            id,
            responses: [response],
            userId: get().user?.id,
            dateCreated: response.dateCreated,
            dateUpdated: response.dateCreated
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
    createNewConversation: () => set(() => ({ apiResponses: [], currentConversationId: uuid() })),
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
    setCurrentConversationId: (currentConversationId => set({ currentConversationId })),

    error: null,
    setError: (error => set({ error })),
}));

export default useAppStore;
