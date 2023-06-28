import React from "react";

import useAppState from "../stores/useAppStore";

import { AiOutlinePlus, AiOutlineUnorderedList } from "react-icons/ai";
import { HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";

const SidePanel: React.FC = () => {
    const conversations = useAppState((state) => state.conversations);
    const setSidePanelOpen = useAppState((state) => state.setSidePanelOpen);

    const handleCloseSidePanel = () => {
        setSidePanelOpen(false);
    }

    return (
        <div className="bg-white h-full p-4">
            <div className="flex justify-evenly">
                <button className="btn btn-primary btn-outline border-primary">
                    <AiOutlinePlus className="text-lg" />
                    New Chat
                </button>

                <button className="btn btn-primary btn-outline border-primary" onClick={handleCloseSidePanel}>
                    <AiOutlineUnorderedList className="text-lg" />
                </button>
            </div>


            <p className="text-sm text-gray-500 font-medium my-4">Recent Activity</p>

            <div>
                {conversations.map((conversations, index) => (
                    <button className="btn btn-ghost text-black border-none w-full flex justify-start my-2 hover:bg-gray-100" key={index}>
                        <HiOutlineChatBubbleOvalLeft className="text-lg" />
                        {conversations.title}
                    </button>))}
            </div>
        </div>
    )
}

export default SidePanel;