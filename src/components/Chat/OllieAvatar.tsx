import React from "react";

import Ollie from "../../assets/ollie.png";

const OllieAvatar: React.FC = () => {
    return (
        <div className={`chat-image avatar `}>
            <div className="w-10 rounded-full">
                <img src={Ollie} />
            </div>
        </div>
    )
}

export default OllieAvatar;