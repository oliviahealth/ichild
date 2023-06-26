import React from "react";

import Ollie from "../../assets/ollie.png";

interface Props {
  text: string | React.ReactNode;
  isResponse: boolean;
}

const ChatBubble: React.FC<Props> = ({ text, isResponse }) => {


  return (
    <div className={`chat w-full ${isResponse ? "chat-start" : "chat-end"} `}>
      <div className={`chat-image avatar ${!isResponse ? "hidden" : ""}`}>
        <div className="w-10 rounded-full">
          <img src={Ollie} />
        </div>
      </div>

      <div className={`flex items-center rounded-lg py-2 px-4 whitespace-pre-wrap ${isResponse ? "bg-white text-black" : "bg-primary text-white"}`}>
        <p>{text}</p>

      </div>
    </div>
  );
};

export default ChatBubble;