import React, { useEffect } from "react";
import axios from "axios";

import { ConversationSchema, IConversation } from "./utils/interfaces";
import useAppState from "./stores/useAppStore";

import ChatComponent from "./components/Chat";
import SidePanel from "./components/SidePanel";

const Index: React.FC = () => {
  const user = useAppState((state) => state.user);

  const setConversations = useAppState((state) => state.setConversations);
  
  const isSidePanelOpen = useAppState((state) => state.isSidePanelOpen);
  const setisSidePanelOpen = useAppState((state) => state.setisSidePanelOpen);

  //Set the sidepanel to be closed by default if the user is on a small screen
  useEffect(() => {
    const windowWidth = window.innerWidth;

    if(windowWidth < 1024) {
      setisSidePanelOpen(false);
    }
  }, []);

  // Fetch past conversations from database
  useEffect(() => {
    const getConversations = async() => {
      try {
        const conversations = (await axios.get(`${import.meta.env.VITE_API_URL}/conversations`, { params: { 'userId': user?.id }, withCredentials: true })).data
        
        conversations.forEach((conversation: IConversation) => ConversationSchema.parse(conversation))

        setConversations(conversations);

      } catch(err: any) {
        const error = err || "Unexpected error";
        alert(error)
      }
    }

    if(user) getConversations()
  }, [user])

  return (
    <div className="flex h-full bg-opacity-80 bg-gray-100">
      <div className="flex h-full w-full">
        <div>
          <div className={`drawer ${isSidePanelOpen ? "drawer-open" : ""} h-full`}>
            <SidePanel />
          </div>
        </div>
        {/* Content for the main container */}
        <div className={`w-full h-full`}>
          <ChatComponent />
        </div>
      </div>
    </div>
  );
};

export default Index;
