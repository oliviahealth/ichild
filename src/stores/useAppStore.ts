import { create } from "zustand";

import { IOllieResponse, IConversation } from "../utils/interfaces";

interface AppState {
    ollieResponses: IOllieResponse[]
    setOllieResponses: (ollieResponse: IOllieResponse[]) => void

    /*
       The conversations array is used to create the side panel of recent chats similar to chat-gpt's side panel.
       The conversations array holds objects of the type: IConversation, which represents the complete dialogue between the user and the api during the current session
       When a user submits a query and the api responds, we update the conversations array by adding the new response to the current conversation object
       When the user exists the app, we hold this conversation in local storage memory
   */
    conversations: IConversation[]
    addQueryToConversation: (id: string, response: IOllieResponse) => void,
    switchConversation: (id: string) => void

    currentConversationId: string | null,
}

const useAppState = create<AppState>()((set) => ({
    ollieResponses: [],
    setOllieResponses: (ollieResponses) => set(() => ({ ollieResponses: [...ollieResponses] })),

    conversations: JSON.parse(localStorage.getItem("conversations") ?? "[]"),
    addQueryToConversation: (id, response) => set((state) => {
        const conversationIndex = state.conversations.findIndex(conversation => conversation.id === id);

        // Conversation exists
        if (conversationIndex !== -1) {
            const updatedConversations = [...state.conversations];
            updatedConversations[conversationIndex].responses.push(response);

            return { conversations: updatedConversations };
        }

        // Conversation doesn't exist
        const newConversation = {
            title: response.userQuery,
            id,
            created: new Date(),
            lastAccessed: new Date(),
            responses: [response],
        };

        return { conversations: [...state.conversations, newConversation], currentConversationId: id };
    }),
    switchConversation: (id) => set((state) => {
        const conversation = state.conversations.find(elm => elm.id === id);

        return { ollieResponses: conversation?.responses, currentConversationId: id }
    }),

    currentConversationId: null,
}));

export default useAppState;
