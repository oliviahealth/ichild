import React from "react";

import useAppStore from "../stores/useAppStore";

import { HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";
import { BsTrash } from "react-icons/bs";
import { TfiMenuAlt } from "react-icons/tfi";

const SidePanel: React.FC = () => {

    const setisSidePanelOpen = useAppStore((state) => state.setisSidePanelOpen);

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
        <>
            <input id="sidepanel" type="checkbox" className="drawer-toggle" />

            <div className="drawer-side h-full absolute">
                <label htmlFor="my-drawer" className="drawer-overlay"></label>

                <div className="w-80 p-4 h-full bg-white text-base-neutral">
                    <div className="flex justify-around">
                        <button className="btn btn-primary w-2/3 btn-outline border-primary" onClick={() => createNewConversaion()}>
                            New Chat
                        </button>

                        <button className="btn btn-primary btn-outline border-primary" onClick={() => setisSidePanelOpen(false)}>
                            <TfiMenuAlt className="text-lg" />
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
            </div>
        </>
    )
}

export default SidePanel;
