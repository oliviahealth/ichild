import React from "react";

import useAppState from "./stores/useAppStore";

import ChatComponent from "./components/Chat";
import SidePanel from "./components/SidePanel";

const App: React.FC = () => {
  const conversations = useAppState((state) => state.conversations);

  // Save the updated conversations to localStorage on unmount
  window.addEventListener("beforeunload", (ev) => {
    ev.preventDefault();

    localStorage.setItem("conversations", JSON.stringify(conversations));
  });

  return (
    <div className="flex h-full bg-opacity-80 bg-gray-100">
      <div className={`max-w-[20%] w-full xl:block hidden`}>
        <SidePanel />
      </div>

      <div className="w-full">
        <ChatComponent />
      </div>
    </div>
  );
};

export default App;
