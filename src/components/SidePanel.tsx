import React, { useEffect } from "react";
import { useMutation } from "react-query";
import { Link, useLocation } from "react-router-dom";

import useAppStore from "../stores/useAppStore";
import fetchWithAxios from "../utils/fetchWithAxios";
import parseWithZod from "../utils/parseWithZod";
import { IConversation, ConversationSchema } from "../utils/interfaces";

import { HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";
import { IoLocationOutline } from "react-icons/io5";
import { BsTrash } from "react-icons/bs";
import { TfiMenuAlt } from "react-icons/tfi";

const SidePanel: React.FC = () => {
    const location = useLocation();
    const user = useAppStore((state) => state.user);

    const setisSidePanelOpen = useAppStore((state) => state.setisSidePanelOpen);

    const conversations = useAppStore((state) => state.conversations);

    const currentConversationId = useAppStore((state) => state.currentConversationId);
    const switchConversation = useAppStore((state) => state.switchConversation);
    const createNewConversation = useAppStore((state) => state.createNewConversation);
    const setConversations = useAppStore((state) => state.setConversations);
    const removeConversation = useAppStore((state) => state.removeConversation);

    const { mutate: deleteConversation, isLoading: isDeleteLoading } = useMutation(async (conversationId: string) => {
        await fetchWithAxios(`${import.meta.env.VITE_API_URL}/conversations?id=${conversationId}`, 'DELETE')
    }, {
        onSuccess: (_error, conversationId, _context) => {
            removeConversation(conversationId);
        }
    })

    const { mutate: getConversations, isLoading } = useMutation(async () => {
        const conversations = await fetchWithAxios(`${import.meta.env.VITE_API_URL}/conversations?userId=${user?.id}`, 'GET');

        // Make sure all of the conversations are compliant with the schema
        conversations.forEach((conversation: IConversation) => parseWithZod(conversation, ConversationSchema));

        return conversations
    }, {
        onSuccess: (conversations) => {
            setConversations(conversations);
        }
    })

    useEffect(() => {
        if (user) {
            getConversations()
        }
    }, [user]);

    return (
        <>
            <input id="sidepanel" type="checkbox" className="drawer-toggle" />

            <div className="drawer-side h-full shadow-xl">
                <label htmlFor="my-drawer" className="drawer-overlay"></label>

                <div className="w-[275px] p-4 h-full bg-white text-base-neutral flex flex-col justify-between">
                    <div>
                        <div className="flex gap-2 justify-around">
                            <Link to={'/'} className="btn btn-primary w-2/3 btn-outline border-primary" onClick={() => createNewConversation()}>
                                New Chat
                            </Link>

                            <button className="btn btn-primary btn-outline border-primary" onClick={() => setisSidePanelOpen(false)}>
                                <TfiMenuAlt className="text-lg" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-500 font-medium my-4">Recent Activity</p>

                        {isLoading && (
                            <div className="flex justify-center">
                                <span className="loading loading-spinner loading-sm text-primary"></span>
                            </div>
                        )}

                        {user ? (
                            <div className="flex flex-col">
                                {conversations.map((conversation, index) => (
                                    <Link to={"/"} onClick={() => switchConversation(conversation.id)} key={index} className={`my-2 p-2 text-sm rounded-lg cursor-pointer flex justify-between items-center hover:bg-gray-100 ${conversation.id === currentConversationId ? "bg-primary text-primary bg-opacity-30 font-semibold hover:bg-primary hover:bg-opacity-40" : ""}`}>
                                        <div className="flex items-center">
                                            <p className="text-lg"><HiOutlineChatBubbleOvalLeft /></p>
                                            <p className="ml-4">{conversation.title}</p>
                                        </div>

                                        <button onClick={() => deleteConversation(conversation.id)} className={`btn btn-ghost btn-sm ${!(conversation.id === currentConversationId) ? "hidden" : ""}`}>
                                            {isDeleteLoading ? (<span className="loading loading-spinner loading-sm"></span>) : (<BsTrash className="text-lg" />)}
                                        </button>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div>
                                <p className="mb-4 text-sm text-gray-500">You must be signed in to see your conversation history</p>

                                <Link to="/signin" className="btn btn-primary w-full btn-outline border-primary">
                                    Sign In
                                </Link>
                            </div>
                        )}
                    </div>

                    {user && (<div>
                        <p className="text-sm text-gray-500 font-medium my-4">Saved</p>

                        <Link to={'/savedlocations'} className={`my-2 p-2 text-sm rounded-lg cursor-pointer flex items-center hover:bg-gray-100 ${location.pathname === '/savedlocations' ? "bg-primary text-primary bg-opacity-30 font-semibold hover:bg-primary hover:bg-opacity-40" : ""}`}>
                            <p className="text-lg"><IoLocationOutline /></p>
                            <p className="ml-4">Locations</p>
                        </Link>

                        <Link to={'/savedchats'} className={`my-2 p-2 text-sm rounded-lg cursor-pointer flex items-center hover:bg-gray-100`}>
                            <p className="text-lg"><HiOutlineChatBubbleOvalLeft /></p>
                            <p className="ml-4">Chats</p>
                        </Link>
                    </div>)}
                </div>
            </div>
        </>
    )
}

export default SidePanel;
