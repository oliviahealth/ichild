import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";
import ErrorComponent from "./ErrorComponent";
import SidePanel from "./SidePanel";

import useAppStore from "../stores/useAppStore";
import { BsBoxArrowRight } from "react-icons/bs";

const Layout = () => {
  const isSidePanelOpen = useAppStore((state) => state.isSidePanelOpen);
  const setisSidePanelOpen = useAppStore((state) => state.setisSidePanelOpen);

  const conversationPreviews = useAppStore((state) => state.conversationPreviews);
  const currentConversationId = useAppStore((state) => state.currentConversationId);

  const currentConversationTitle = conversationPreviews.find(conversationPreview => conversationPreview.id === currentConversationId)?.title ?? "";

  //Set the sidepanel to be closed by default if the user is on a small screen
  useEffect(() => {
    const windowWidth = window.innerWidth;

    if (windowWidth < 1024) {
      setisSidePanelOpen(false);
    }
  }, []);

  //Open the sidepanel when going from mobile to desktop
  window.addEventListener('resize',() => {
    const windowWidth = window.innerWidth;

    if (windowWidth >= 1024) {
      setisSidePanelOpen(true);
    }
  });

  return (
    <div className="h-screen overflow-hidden">
      <div className="flex flex-col h-screen text-black bg-[url('../assets/background.png')]">
        <div className="shadow-2xl bg-white">
          <Navbar />
        </div>

        <div className="w-full xl:container mx-auto h-full m-2">
          { /* Render all children components with the Outlet 
                https://reactrouter.com/en/main/components/outlet
          */ }
          <div className="flex flex-col h-full bg-opacity-80 bg-gray-100 rounded-box">
            <div className={`flex items-center gap-4 md:hidden w-full px-4 py-2 bg-zinc-200  ${isSidePanelOpen ? "hidden" : ""}`} onClick={() => setisSidePanelOpen(!isSidePanelOpen)}>
              <span className="cursor-pointer text-lg" ><BsBoxArrowRight /></span>
            
              <p className="text-sm underline truncate">{ currentConversationTitle }</p>
            </div>
            <div className="flex h-full w-full">
              <div>
                <div className={`drawer ${isSidePanelOpen ? "drawer-open" : ""} h-full`}>
                  <SidePanel />
                </div>
              </div>
              {/* Content for the main container */}
              <div className={`w-full h-full`}>
                <ErrorComponent />
                <Outlet />
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Layout;