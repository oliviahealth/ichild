import React from "react";

import { IoPersonSharp } from "react-icons/io5";
import { HiChatBubbleOvalLeft } from "react-icons/hi2";
import { BiSolidBookmark } from "react-icons/bi";

const UserPage: React.FC = () => {
    return (
        <div className="p-8 px-12 space-y-14 h-full">
            <div role="tablist" className="tabs tabs-boxed">
                <div role='tab' className="tab tab-active space-x-1">
                    <p className="text-lg"><IoPersonSharp /></p>

                    <p>Account</p>
                </div>
                <div role='tab' className="tab space-x-1 text-gray-400">
                    <p className="text-lg"><HiChatBubbleOvalLeft /></p>

                    <p>All Chats</p>
                </div>
                <div role='tab' className="tab space-x-1 text-gray-400">
                    <p className="text-lg"><BiSolidBookmark /></p>

                    <p>Saved</p>
                </div>
            </div>

            <div className="space-y-1">
                <h1 className="text-5xl">Account</h1>
                <p className="text-xl">Manage your account settings</p>
            </div>

            <div className="h-full space-y-10">
                <div>
                    <p className="text-xl ml-2">Name</p>
                    <div className="join w-full">
                        <div className="w-full max-w-2xl">
                            <input className="input input-bordered join-item w-full bg-gray-300 border-none focus:outline-none" placeholder="Search" />
                        </div>

                        <div className="indicator">
                            <button className="btn join-item bg-gray-300 border-none">Edit</button>
                        </div>
                    </div>
                </div>

                <div>
                    <p className="text-xl ml-2">Email</p>
                    <div className="join w-full">
                        <div className="w-full max-w-2xl">
                            <input className="input input-bordered join-item w-full bg-gray-300 border-none focus:outline-none" placeholder="Search" />
                        </div>

                        <div className="indicator">
                            <button className="btn join-item bg-gray-300 border-none">Edit</button>
                        </div>
                    </div>
                </div>

                <div>
                    <p className="text-xl ml-2">Password</p>
                    <div className="join w-full">
                        <div className="w-full max-w-2xl">
                            <input className="input input-bordered join-item w-full bg-gray-300 border-none focus:outline-none" placeholder="Search" />
                        </div>

                        <div className="indicator">
                            <button className="btn join-item bg-gray-300 border-none">Edit</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserPage;