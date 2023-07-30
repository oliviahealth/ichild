import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="h-screen">
      <div className="flex flex-col h-screen text-black bg-[url('../assets/background.png')]">
        <div className="shadow-2xl bg-white">
          <Navbar />
        </div>

        <div className="w-full xl:container mx-auto h-full">
          <Outlet />
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Layout;
