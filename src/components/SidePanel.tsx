import React, { useEffect } from "react";
import { useMutation } from "react-query";
import { Link, useLocation } from "react-router-dom";

import useAppStore from "../stores/useAppStore";
import fetchWithAxios from "../utils/fetchWithAxios";
import parseWithZod from "../utils/parseWithZod";
import { IConversationDetail, ConversationDetailSchema } from "../utils/interfaces";

import { HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";
import { IoLocationOutline } from "react-icons/io5";
import { BsTrash } from "react-icons/bs";
import { TfiMenuAlt } from "react-icons/tfi";

const SidePanel: React.FC = () => {
    const location = useLocation();
    const user = useAppStore((state) => state.user);

    const setisSidePanelOpen = useAppStore((state) => state.setisSidePanelOpen);

    const conversationDetails = useAppStore((state) => state.conversationDetails);
    const setConversationDetails = useAppStore((state) => state.setConversationDetails);

    const currentConversationId = useAppStore((state) => state.currentConversationId);
    const setCurrentConversationId = useAppStore((state) => state.setCurrentConversationId);

    const { mutate: deleteConversation, isLoading: isDeleteLoading } = useMutation(async (conversationId: string) => {
        await fetchWithAxios(`${import.meta.env.VITE_API_URL}/conversations?id=${conversationId}`, 'DELETE')

        return conversationId
    }, {
        onSuccess: (conversationId) => {
            setConversationDetails(conversationDetails.filter((conversationDetail) => conversationDetail.id !== conversationId));

            setCurrentConversationId(null);
        }
    })

    const { mutate: getConversationDetails, isLoading } = useMutation(async () => {
        const conversationDetails: IConversationDetail[] = await fetchWithAxios(`${import.meta.env.VITE_API_URL}/conversationdetails?userId=${user?.id}`);

        conversationDetails.forEach((conversationDetail) => parseWithZod(conversationDetail, ConversationDetailSchema));

        return conversationDetails
    }, {
        onSuccess: (conversationDetails) => {
            setConversationDetails(conversationDetails);
        }
    })

    useEffect(() => {
        if (user) {
            getConversationDetails()
        }
    }, [user]);

    const createNewConversation = () => {
        setCurrentConversationId(null);
    }

    return (
        <>
            <input id="sidepanel" type="checkbox" className="drawer-toggle" />

            <div className="drawer-side h-full shadow-xl rounded-box rounded-br-none bg-white text-base-neutral">
                <label htmlFor="my-drawer" className="drawer-overlay"></label>

                <div className="w-[275px] p-4 h-full flex flex-col justify-between">
                    <div>
                        <div className="flex gap-2 justify-around">
                            <Link to={'/'} className="btn btn-primary w-2/3 btn-outline border-primary" onClick={createNewConversation}>
                                New Chat
                            </Link>

                            <button className="btn btn-primary btn-outline border-primary" onClick={() => setisSidePanelOpen(false)}>
                                <TfiMenuAlt className="text-lg" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-500 my-4 font-semibold">Recent Activity</p>

                        {user ? (
                            <div className="flex flex-col overflow-y-auto max-h-[calc(100vh-26rem)]">
                                {conversationDetails.map((conversationDetail, index) => (
                                    <Link to={"/"} onClick={() => setCurrentConversationId(conversationDetail.id)} key={index} className={`my-2 p-2 text-sm rounded-lg cursor-pointer flex justify-between items-center hover:bg-gray-100 ${conversationDetail.id === currentConversationId ? "bg-primary text-primary bg-opacity-30 font-semibold hover:bg-primary hover:bg-opacity-40" : ""}`}>
                                        <div className="flex items-center">
                                            <p className="text-lg"><HiOutlineChatBubbleOvalLeft /></p>
                                            <p className="ml-4">{conversationDetail.title}</p>
                                        </div>

                                        <button onClick={() => deleteConversation(conversationDetail.id)} className={`btn btn-ghost btn-sm ${!(conversationDetail.id === currentConversationId) ? "hidden" : ""}`}>
                                            {isDeleteLoading ? (<span className="loading loading-spinner loading-sm"></span>) : (<BsTrash className="text-lg" />)}
                                        </button>
                                    </Link>
                                ))}

                                { /* Only display the load previous chats button if no chats are currently being loaded and if the conversations array length is less than 5 */}
                                {!isLoading && conversationDetails && !(conversationDetails.length < 5) && (<button className="btn btn-sm border-none text-black hover:bg-gray-400 bg-gray-300 my-4">
                                    Previous Chats
                                </button>)}
                            </div>
                        ) : (
                            <div>
                                <p className="mb-4 text-sm text-gray-500">You must be signed in to see your conversation history</p>

                                <Link to="/signin" className="btn btn-primary w-full btn-outline border-primary">
                                    Sign In
                                </Link>
                            </div>
                        )}

                        {isLoading && (
                            <div className="flex justify-center">
                                <span className="loading loading-spinner loading-sm text-primary"></span>
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
