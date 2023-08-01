import React, { useEffect } from "react";

import { ConversationSchema } from "./utils/interfaces";
import useAppState from "./stores/useAppStore";

import ChatComponent from "./components/Chat";
import SidePanel from "./components/SidePanel";

const Index: React.FC = () => {
  const conversations = useAppState((state) => state.conversations);
  const isConversationOutdated = useAppState(
    (state) => state.isConversationOutdated
  );

  const isSidePanelOpen = useAppState((state) => state.isSidePanelOpen);
  const setisSidePanelOpen = useAppState((state) => state.setisSidePanelOpen);

  // Save the updated conversations to localStorage on unmount
  window.addEventListener("beforeunload", (ev) => {
    ev.preventDefault();

    // Filter out all of the conversations that are outdated (30+ days since the last time it was accessed)
    // Make sure every conversation we're going to save is complient with the expected conversation schema
    const saveConversations = conversations.filter(
      (conversation) => isConversationOutdated(conversation.id) === false && ConversationSchema.safeParse(conversation).success
    );

    localStorage.setItem("conversations", JSON.stringify(saveConversations));
  });

  //Set the sidepanel to be closed by default if the user is on a small screen
  useEffect(() => {
    const windowWidth = window.innerWidth;

    if(windowWidth < 1024) {
      setisSidePanelOpen(false);
    }
  }, [])

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
