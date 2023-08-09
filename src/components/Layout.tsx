import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";
import ErrorComponent from "./ErrorComponent";
import SidePanel from "./SidePanel";

import useAppStore from "../stores/useAppStore";

const Layout = () => {
  const isSidePanelOpen = useAppStore((state) => state.isSidePanelOpen);
  const setisSidePanelOpen = useAppStore((state) => state.setisSidePanelOpen);

  //Set the sidepanel to be closed by default if the user is on a small screen
  useEffect(() => {
    const windowWidth = window.innerWidth;

    if (windowWidth < 1024) {
      setisSidePanelOpen(false);
    }
  }, []);


  return (
    <div className="h-screen">
      <div className="flex flex-col h-screen text-black bg-[url('../assets/background.png')]">
        <div className="shadow-2xl bg-white">
          <Navbar />
        </div>

        <div className="w-full xl:container mx-auto h-full">
          { /* Render all children components with the Outlet 
                https://reactrouter.com/en/main/components/outlet
          */ }
          <div className="flex h-full bg-opacity-80 bg-gray-100">
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