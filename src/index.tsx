import React, { useEffect, useState } from "react";
import axios from "axios";

import { ConversationSchema, IConversation } from "./utils/interfaces";
import useAppState from "./stores/useAppStore";

import ChatComponent from "./components/Chat";
import SidePanel from "./components/SidePanel";

const Index: React.FC = () => {
  const [unloadFired, setUnloadFired] = useState(false);

  const user = useAppState((state) => state.user);

  const conversations = useAppState((state) => state.conversations);
  const setConversations = useAppState((state) => state.setConversations);
  const isConversationOutdated = useAppState(
    (state) => state.isConversationOutdated
  );

  const isSidePanelOpen = useAppState((state) => state.isSidePanelOpen);
  const setisSidePanelOpen = useAppState((state) => state.setisSidePanelOpen);

  // Save the updated conversations to localStorage on unmount
  window.addEventListener("beforeunload", (ev) => {
    console.log("unload")

    ev.preventDefault();

    // Filter out all of the conversations that are outdated (30+ days since the last time it was accessed)
    // Make sure every conversation we're going to save is complient with the expected conversation schema
    const saveConversations = conversations.filter(
      (conversation) => isConversationOutdated(conversation.id) === false && ConversationSchema.safeParse(conversation).success
    );

    if(user && !unloadFired) {
      // Save conversation history to database
      axios.post(`${import.meta.env.VITE_API_URL}/conversations`, saveConversations, { withCredentials: true }).then((res) => setUnloadFired(true)).catch((error) => console.log(error));
    }
  });

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
        const { conversations } = (await axios.get(`${import.meta.env.VITE_API_URL}/conversations`, { params: { 'userId': user?.id }, withCredentials: true })).data

        conversations.forEach((conversation: IConversation) => ConversationSchema.parse(conversation))

        setConversations(conversations);

      } catch(err: any) {
        const error = err ?? "Unexpected error";
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
