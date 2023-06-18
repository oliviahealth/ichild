import React from "react";

interface Props {
    children: React.ReactNode
}

const Layout: React.FC<Props> = ({ children }) => {
    return (
        <div className="flex flex-col h-screen">

            <div className="container mx-auto px-4 flex-1">
                { children }
            </div>
        </div>
    )
}

export default Layout;