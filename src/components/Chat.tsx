import React from "react";
import { MdArrowForwardIos } from "react-icons/md";

import Ollie from "../assets/ollie.png";

interface ChatProps {
  text: string;
  isResponse: boolean;
}
const Chat: React.FC<ChatProps> = ({ text, isResponse }) => {
  return (
    <div className={`chat ${isResponse ? "chat-start" : "chat-end"} max-w-md`}>
      <div className="chat-image avatar">
        <div className="w-14 rounded-full">
          <img src={Ollie} />
        </div>
      </div>
      <div className="chat-bubble bg-primary text-white">{text}</div>
    </div>
  );
};

const ChatInput: React.FC = () => {
  return (
    <div className="flex h-full">
      <div className="w-11/12">
        <input type="text" placeholder="Ask me a question" className="input border-gray-200 text-black w-full h-full focus:outline-none" />
      </div>
      <button className="btn h-full w-1/12 bg-primary text-white flex justify-center items-center hover:bg-primary-focus border-none">
        <MdArrowForwardIos className="text-5xl hover:opacity-70 hover:cursor-pointer" />
      </button>
    </div>
  );
};

const ChatComponent: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="h-[90%] p-4 bg-gray-100 opacity-80">
        <Chat text="Hi! I’m Ollie, your virtual assistant for the OliviaHealth network. How can I help you?" isResponse={true} />
      </div>
      <div className="h-[10%] bg-white">
        <ChatInput />
      </div>
    </div>
  );
};

export default ChatComponent;
