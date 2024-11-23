import React, { useEffect } from "react";
import { useMutation } from "react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { v4 as uuid } from "uuid";

import useAppStore from "../stores/useAppStore";
import parseWithZod from "../utils/parseWithZod";
import { IConversationPreview, ConversationPreviewSchema } from "../utils/interfaces";

import { BsTrash, BsBoxArrowInLeft } from "react-icons/bs";
import { FiPlus } from "react-icons/fi";
import { CgProfile } from "react-icons/cg";
import { RxExit } from "react-icons/rx";
import { RiAdminLine } from "react-icons/ri";
import { IoLocationOutline } from "react-icons/io5";

const SidePanel: React.FC = () => {
    const navigate = useNavigate();
    const setError = useAppStore(state => state.setError);

    const location = useLocation();
    const user = useAppStore((state) => state.user);
    const accessToken = useAppStore((state) => state.accessToken);
    const isSidePanelOpen = useAppStore((state) => state.isSidePanelOpen);
    const setisSidePanelOpen = useAppStore((state) => state.setisSidePanelOpen);

    const conversationPreviews = useAppStore((state) => state.conversationPreviews);
    const setConversationPreviews = useAppStore((state) => state.setConversationPreviews);

    const currentConversationId = useAppStore((state) => state.currentConversationId);
    const setCurrentConversationId = useAppStore((state) => state.setCurrentConversationId);

    { /* Delete conversation based on a specific id and if successful, remove the conversation from the sidepanel and set the current conversation to be null  */ }
    const { mutate: deleteConversation, isLoading: isDeleteLoading } = useMutation(async (conversationId: string) => {
        const headers = {
            "Authorization": "Bearer " + accessToken,
            "userId": user?.id,
        }

        await axios.delete(`${import.meta.env.VITE_API_URL}/conversation?id=${currentConversationId}`, { headers: { ...headers }, withCredentials: true })

        return conversationId
    }, {
        onSuccess: (conversationId) => {
            setConversationPreviews(conversationPreviews.filter((conversationDetail) => conversationDetail.id !== conversationId));

            setCurrentConversationId(null);

            getConversationPreviews();
        },
        onError: (error: AxiosError) => {
            if(error.request.status === 403) {
                navigate('/signin')
            }

            setError(error.message);
        }
    })

    { /* Fetch only the id and title of each previous conversation the user has had to populate the recent activity on the sidepanel */ }
    const { mutate: getConversationPreviews } = useMutation(async () => {
        const headers = {
            "Authorization": "Bearer " + accessToken,
            "userId": user?.id,
        }

        const conversationPreviews: IConversationPreview[] = (await axios.get(`${import.meta.env.VITE_API_URL}/conversationpreviews?limit=5`, { headers: { ...headers }, withCredentials: true })).data;

        conversationPreviews.forEach((conversationDetail) => parseWithZod(conversationDetail, ConversationPreviewSchema));

        return conversationPreviews
    }, {
        onSuccess: (conversationDetails) => {
            setConversationPreviews(conversationDetails);
        }
    })

    const { mutate: handleSignout } = useMutation(async () => {
        const headers = {
          "Authorization": "Bearer " + accessToken,
        }
    
        await axios.post(`${import.meta.env.VITE_API_URL}/signout`, null, { headers: { ...headers }, withCredentials: true })
      }, {
        onSettled: () => {
          sessionStorage.removeItem('accessToken');
    
          navigate(0);
        }
      })

    useEffect(() => {
        if (user) {
            getConversationPreviews()
        }
    }, [user]);

    { /* Set the current conversation to be null whenever the 'New Chat' button is clicked */ }
    const createNewConversation = () => {
        setCurrentConversationId(uuid());
    }

    return (
        <>
            <input id="sidepanel" type="checkbox" className="drawer-toggle" />

            <div className={`drawer-side h-full md:rounded-box bg-white ${isSidePanelOpen ? 'bg-opacity-50' : 'bg-opacity-0'} text-base-neutral`}>
                <label htmlFor="my-drawer" className="drawer-overlay"></label>

                <div className="w-[275px] py-4 px-0 h-full flex flex-col justify-between">
                    <div>
                        <div className="flex gap-2 justify-between items-center px-4">
                            <Link to={'/'} className="btn rounded-xl md:w-full bg-gray-100 border-none shadow-none text-xl text-black hover:bg-gray-200" onClick={createNewConversation}>
                                <FiPlus className="text-xl" /> New Chat
                            </Link>

                            <button className="md:hidden" onClick={() => setisSidePanelOpen(false)} >
                                <BsBoxArrowInLeft className="text-lg" />
                            </button>
                        </div>

                        <p className="text-xl text-black my-4 mt-6 font-semibold px-4">Recent Activity</p>

                        {user ? (
                            <div className="flex flex-col overflow-y-auto max-h-[calc(100vh-33.5rem)]">
                                {conversationPreviews.map((conversationDetail, index) => {
                                    const isSelected = conversationDetail.id === currentConversationId;
                                    return <Link to={"/"} onClick={() => setCurrentConversationId(conversationDetail.id)} key={index} className={`my-2 p-2 mx-0 text-base rounded-lg cursor-pointer flex justify-between items-center px-[24px] rounded-none ${isSelected ? "bg-[#E8E0E0] hover:bg-[#D8D0D0] text-primary font-semibold shadow-[inset_5px_0_0_0_var(--tw-shadow-color)] shadow-primary" : "hover:bg-gray-100"}`}>
                                        <div className="flex items-center">
                                            <p>{conversationDetail.title}</p>
                                        </div>

                                        <button onClick={() => deleteConversation(conversationDetail.id)} className={`btn btn-ghost btn-sm ${!isSelected ? "hidden" : ""}`}>
                                            {isDeleteLoading ? (<span className="loading loading-spinner loading-sm"></span>) : (<BsTrash className="text-lg opacity-50 hover:opacity-100 transition-opacity duration-100" />)}
                                        </button>
                                    </Link>
                                })}
                            </div>
                        ) : (
                            <div>
                                <p className="mb-4 text-base text-gray-500">You must be signed in to see your conversation history</p>
                            </div>
                        )}
                    </div>

                    {user && (<div>
                        <div className="pb-6">
                            <p className="text-xl text-black font-medium my-4 px-4">Saved</p>

                            <Link to={'/savedlocations'} className={`my-2 py-2 px-6 text-base cursor-pointer flex items-center ${location.pathname === '/savedlocations' ? "text-primary bg-[#E8E0E0] hover:bg-[#D8D0D0] font-semibold shadow-[inset_5px_0_0_0_var(--tw-shadow-color)] shadow-primary" : "hover:bg-gray-100"}`}>
                                <p className="text-lg"><IoLocationOutline /></p>
                                <p className="ml-4">Locations</p>
                            </Link>

                            {/* <Link to={'/savedchats'} className={`my-2 p-2 text-base rounded-lg cursor-pointer flex items-center hover:bg-gray-100 ${location.pathname === '/savedchats' ? "bg-primary text-primary bg-opacity-30 font-semibold hover:bg-primary hover:bg-opacity-40" : ""}`}>
                                <p className="text-lg"><HiOutlineChatBubbleOvalLeft /></p>
                                <p className="ml-4">Chats</p>
                            </Link> */}
                        </div>

                        <hr />

                        <div>
                            <Link to={'/settings/user'} className={`my-2 py-2 px-6 text-xl flex items-center ${location.pathname === '/settings/user' ? "text-primary bg-[#E8E0E0] hover:bg-[#D8D0D0] font-semibold shadow-[inset_5px_0_0_0_var(--tw-shadow-color)] shadow-primary" : "hover:bg-gray-100"}`}>
                                <p className="text-lg"><CgProfile /></p>
                                <p className="ml-4">{user.name}</p>
                            </Link>

                            {user.isAdmin && (<a href={`${import.meta.env.VITE_API_URL}/admin`} className={`my-2 py-2 px-6 text-xl cursor-pointer flex items-center hover:bg-gray-100`}>
                                <p className="text-lg"><RiAdminLine /></p>
                                <p className="ml-4">Admin</p>
                            </a>)}

                            <span onClick={() => handleSignout()} className={`my-2 py-2 px-6 text-xl cursor-pointer flex items-center hover:bg-gray-100`}>
                                <p className="text-lg"><RxExit /></p>
                                <p className="ml-4">Sign out</p>
                            </span>
                        </div>
                    </div>)}
                </div>
            </div>
        </>
    )
}

export default SidePanel;
