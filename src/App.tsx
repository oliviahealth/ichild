import React from "react";

import useAppState from "./stores/useAppStore";

import ChatComponent from "./components/Chat";
import SidePanel from "./components/SidePanel";

const App: React.FC = () => {
  const conversations = useAppState((state) => state.conversations);

  const sidePanelOpen = useAppState((state) => state.sidePanelOpen);

  window.addEventListener("beforeunload", (ev) => {
    ev.preventDefault();

    localStorage.setItem("conversations", JSON.stringify(conversations));

    return;
  });

  return (
    <div className="flex h-full bg-opacity-80 bg-gray-100">
      <div className={`w-1/5 ${!sidePanelOpen ? "hidden" : ""}`}>
        <SidePanel />
      </div>

      <div className="w-full">
        <ChatComponent />
      </div>
    </div>
  );
};

export default App;
