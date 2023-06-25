import React from "react";

const Footer: React.FC = () => {
    return (
        <div className="bg-primary text-white text-sm sm:p-4">
            <div className="w-3/4 mx-auto flex flex-wrap justify-center">
                <a href="www.tamu.edu" target="_blank" className="m-2">© 2023 TEXAS A&M UNIVERSITY</a>
                <a href="https://it.tamu.edu/site-policies.php" target="_blank" className="m-2">SITE POLICIES</a>
                <a href="https://itaccessibility.tamu.edu/" target="_blank" className="m-2">WEB ACCESSIBILITY</a>
            </div>
        </div>
    )
}

export default Footer;