import React from "react";

import useAppState from "../stores/useAppStore";

import { AiOutlinePlus, AiOutlineUnorderedList } from "react-icons/ai";
import { HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";

const SidePanel: React.FC = () => {
    const conversations = useAppState((state) => state.conversations);
    
    const currentConversationId = useAppState((state) => state.currentConversationId);
    const switchConversation = useAppState((state) => state.switchConversation);

    return (
        <div className="bg-white h-full p-4">
            <div className="flex justify-around">
                <button className="btn btn-primary btn-outline border-primary">
                    <AiOutlinePlus className="text-lg" />
                    New Chat
                </button>

                <button className="btn btn-primary btn-outline border-primary" >
                    <AiOutlineUnorderedList className="text-lg" />
                </button>
            </div>

            <p className="text-sm text-gray-500 font-medium my-4">Recent Activity</p>

            <div className="flex flex-col">
                {conversations.map((conversation, index) => (
                    <div onClick={() => switchConversation(conversation.id)} key={index} className={`my-2 p-2 text-sm rounded-lg cursor-pointer flex items-center hover:bg-gray-100 ${ conversation.id === currentConversationId ? "bg-primary text-primary bg-opacity-30 font-semibold hover:bg-primary hover:bg-opacity-40" : "" }`}>
                        <p className="text-lg"><HiOutlineChatBubbleOvalLeft /></p>
                        <p className="ml-4">{ conversation.title }</p>
                    </div>
                    ))}
            </div>
        </div>
    )
}

export default SidePanel;