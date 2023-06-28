import { create } from "zustand";

import { IOllieResponse, IConversation } from "../utils/interfaces";

interface AppState {
    ollieResponses: IOllieResponse[]
    setOllieResponses: (ollieResponse: IOllieResponse[]) => void

     /*
        The conversations array is used to create the side panel of recent chats similar to chat-gpt's side panel.
        The conversations array holds objects of the type: IConversation, which represents the complete dialogue between the user and the api during the current session
        When a user submits a query and the api responds, we update the conversations array by adding the new question and response to the current IConversation object
        When the user exists the app, we hold this conversation in local storage memory
    */
    conversations: IConversation[]
    addQueryToConversation: (id: string, question: string, response: string) => void

    sidePanelOpen: boolean
    setSidePanelOpen: (sidePanelOpen: boolean) => void
}

const useAppState = create<AppState>()((set) => ({
    ollieResponses: [],
    setOllieResponses: (ollieResponses) => set(() => ({ ollieResponses: [...ollieResponses] })),

    conversations: JSON.parse(localStorage.getItem("conversations")!),
    addQueryToConversation: (id, question, response) => set((state) => {
        const conversationIndex = state.conversations.findIndex(conversation => conversation.id === id);

        if (conversationIndex !== -1) {
            const updatedConversations = [...state.conversations];
            updatedConversations[conversationIndex].queries.push({ question, response });

            return { conversations: updatedConversations };
        }

        const newConversation = {
            title: question,
            id,
            created: new Date(),
            lastAccessed: new Date(),
            queries: [{ question, response }]
        };

        return { conversations: [...state.conversations, newConversation] };
    }),

    sidePanelOpen: true,
    setSidePanelOpen: (sidePanelOpen) => set(() => ({ sidePanelOpen }))
}));

export default useAppState;
