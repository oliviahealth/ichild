import React, { useRef } from "react";

import { BiCopy } from "react-icons/bi";
import Ollie from "../../assets/ollie.png";

interface Props {
  text: string | React.ReactNode;
  isResponse: boolean;
}

const ChatBubble: React.FC<Props> = ({ text, isResponse }) => {
  const textRef = useRef<HTMLParagraphElement>(null);

  const copyText = () => {
    if (textRef.current) {
      const currentText = textRef.current.innerText;
      navigator.clipboard.writeText(currentText);
    }
  }

  return (
    <div className={`chat w-full ${isResponse ? "chat-start" : "chat-end"} `}>
      <div className={`chat-image avatar ${!isResponse ? "hidden" : ""}`}>
        <div className="w-10 rounded-full">
          <img src={Ollie} />
        </div>
      </div>

      <div className={`flex items-center rounded-lg py-2 px-4 whitespace-pre-wrap ${isResponse ? "bg-white text-black" : "bg-primary text-white"}`}>
        <div ref={textRef}>{text}</div>

        <button className={`btn btn-square btn-xs bg-inherit border-none ml-4 hover:bg-gray-200 ${ !isResponse ? "hidden" : "" }`} onClick={copyText}>
          <BiCopy className="text-xl text-black" />
        </button>
      </div>
    </div>
  );
};

export default ChatBubble;