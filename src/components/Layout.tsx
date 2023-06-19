import React from "react";

import Navbar from "./Navbar";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen text-black">
      <div className="shadow-md">
        <Navbar />
      </div>

      <div className="container mx-auto px-4 flex-1">{children}</div>
    </div>
  );
};

export default Layout;
