import React, { useState, useEffect } from "react";

import Navbar from "./Navbar";
import Footer from "./Footer";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  const [authorized, setAuthorized] = useState(false);

  const handleAuth = () => setAuthorized(true);

  useEffect(() => {
    handleAuth();
  }, [])

  return (
    <div className="h-screen">
      {authorized && (
      <div className="flex flex-col h-screen text-black bg-[url('../assets/background.png')]">
        <div className="shadow-lg bg-white">
          <Navbar />
        </div>

        <div className="w-full xl:container mx-auto h-full">{children}</div>

        <Footer />
      </div>
      )}
    </div>
  );
};

export default Layout;
