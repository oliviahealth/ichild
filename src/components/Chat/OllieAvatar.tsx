import React from "react";

import Ollie from "../../assets/ollie.png";

const OllieAvatar: React.FC = () => {
    return (
        <div className={`chat-image avatar `}>
            <div className="w-12 rounded-full">
                <img className="shadow-2xl" src={Ollie} />
            </div>
        </div>
    )
}

export default OllieAvatar;