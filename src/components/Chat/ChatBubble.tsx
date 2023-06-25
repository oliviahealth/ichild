import React from "react";

import Ollie from "../../assets/ollie.png";

interface Props {
  text: string | React.ReactNode;
  isResponse: boolean;
}

const ChatBubble: React.FC<Props> = ({ text, isResponse }) => {
  return (
    <div className={`chat w-full ${isResponse ? "chat-start" : "chat-end"} `}>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <img src={Ollie} className={`${!isResponse ? "hidden" : ""}`} />
          <img className={`${isResponse ? "hidden" : ""}`} src="https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541" />
        </div>
      </div>
      <p className={`chat-bubble whitespace-pre-wrap ${isResponse ? "bg-primary" : "bg-gray-500"} text-white`}>{text}</p>
    </div>
  );
};

export default ChatBubble;