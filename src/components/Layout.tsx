import React from "react";

import Navbar from "./Navbar";
import Footer from "./Footer";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen text-black">
      <div className="shadow-md">
        <Navbar />
      </div>

      <div className="container mx-auto p-4 flex-1">{children}</div>

      <Footer />
    </div>
  );
};

export default Layout;
