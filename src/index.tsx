import React, { useEffect } from "react";

import fetchWithAxios from "./utils/fetchWithAxios";
import parseWithZod from "./utils/parseWithZod";
import { IConversation, ConversationSchema } from "./utils/interfaces";
import useAppStore from "./stores/useAppStore";

import ChatComponent from "./components/Chat";

const Index: React.FC = () => {
  const user = useAppStore((state) => state.user);

  const setConversations = useAppStore((state) => state.setConversations);

  // Fetch past conversations from database if a user is logged in
  useEffect(() => {
    const getAndStoreConversations = async () => {
      if (user) {
        const conversations = await fetchWithAxios(`${import.meta.env.VITE_API_URL}/conversations?userId=${user.id}`, 'GET');

        // Make sure all of the conversations are compliant with the schema
        conversations.forEach((conversation: IConversation) => parseWithZod(conversation, ConversationSchema));

        setConversations(conversations)
      }
    }

    getAndStoreConversations()
  }, [user]);

  return (
    <ChatComponent />
  );
};

export default Index;