import React from "react";

import useAppStore from "../stores/useAppStore";

import { AiOutlinePlus } from "react-icons/ai";
import { HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";
import { BsTrash } from "react-icons/bs";

const SidePanel: React.FC = () => {
    const conversations = useAppStore((state) => state.conversations);

    const currentConversationId = useAppStore((state) => state.currentConversationId);
    const switchConversation = useAppStore((state) => state.switchConversation);
    const createNewConversaion = useAppStore((state) => state.createNewConversation);
    const deleteConversation = useAppStore((state) => state.deleteConversation);

    const handleConversationDelete = (evt: React.MouseEvent, id: string) => {
        evt.stopPropagation();

        deleteConversation(id);
    }

    return (
        <div className="bg-white h-full p-4">
            <div className="flex justify-around">
                <button className="btn btn-primary w-full btn-outline border-primary" onClick={() => createNewConversaion()}>
                    <AiOutlinePlus className="text-lg" />
                    New Chat
                </button>
            </div>

            <p className="text-sm text-gray-500 font-medium my-4">Recent Activity</p>

            <div className="flex flex-col">
                {conversations.map((conversation, index) => (
                    <div onClick={() => switchConversation(conversation.id)} key={index} className={`my-2 p-2 text-sm rounded-lg cursor-pointer flex justify-between items-center hover:bg-gray-100 ${conversation.id === currentConversationId ? "bg-primary text-primary bg-opacity-30 font-semibold hover:bg-primary hover:bg-opacity-40" : ""}`}>
                        <div className="flex items-center">
                            <p className="text-lg"><HiOutlineChatBubbleOvalLeft /></p>
                            <p className="ml-4">{conversation.title}</p>
                        </div>

                        <button onClick={(evt) => handleConversationDelete(evt, conversation.id)} className={`btn btn-ghost btn-sm ${!(conversation.id === currentConversationId) ? "hidden" : ""}`}>
                            <BsTrash className="text-lg" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SidePanel;