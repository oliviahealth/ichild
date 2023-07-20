import React from "react";

interface Props {
    children: React.ReactNode
    isResponse: boolean
}

const ChatBubble: React.FC<Props> = ({ children, isResponse }) => {
    return (
        <div className={`chat ${isResponse ? "chat-start" : "chat-end"}`}>
            <div className={`rounded-lg  py-2 px-4 whitespace-pre-wrap ${isResponse ? "bg-white text-black" : "bg-primary text-white"}`}>
                { children }    
            </div>
        </div>
    )
};

export default ChatBubble;