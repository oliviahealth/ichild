import React from "react";

const Footer: React.FC = () => {
    return (
        <div className="bg-primary text-white p-6">
            <div className="w-3/4 mx-auto flex flex-wrap justify-center">
                <a href="www.tamu.edu" target="_blank" className="m-2">© 2023 TEXAS A&M UNIVERSITY</a>
                <a href="https://www.tamu.edu/statements/index.html" className="m-2">SITE POLICIES</a>
                <p className="m-2">WEB ACCESSIBILITY</p>
            </div>
        </div>
    )
}

export default Footer;