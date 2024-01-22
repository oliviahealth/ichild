import React, { useState } from "react";

import { IoPersonSharp } from "react-icons/io5";
import { HiChatBubbleOvalLeft } from "react-icons/hi2";
import { BiSolidBookmark } from "react-icons/bi";

import useAppStore from "../stores/useAppStore";

const UserPage: React.FC = () => {
    const user = useAppStore(state => state.user);

    const [name, setName] = useState(user?.name);
    const [nameEdited, setNameEdited] = useState(false);

    const [email, setEmail] = useState(user?.email);
    const [emailEdited, setEmailEdited] = useState(false);

    const [password, setPassword] = useState('');
    const [passwordEdited, setPasswordEdited] = useState(false);

    const handleNameEdited = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setName(evt.target.value);

        if(evt.target.value === user?.name) {
            setNameEdited(false);
        } else {
            setNameEdited(true);
        }
    }

    const handleEmailEdited = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(evt.target.value);

        if(evt.target.value === user?.email) {
            setEmailEdited(false);
        } else {
            setEmailEdited(true);
        }
    }

    const handlePasswordEdited = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(evt.target.value);

        if(evt.target.value != '') {
            setPasswordEdited(true);
        } else {
            setPasswordEdited(false);
        }
    }

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
                            <input className="input input-bordered join-item w-full bg-gray-300 border-none focus:outline-none" value={name} onChange={handleNameEdited} />
                        </div>

                        <div className="indicator">
                            <button disabled={!nameEdited} className="btn join-item bg-gray-300 disabled:text-gray-200 border-none">Save</button>
                        </div>
                    </div>
                </div>

                <div>
                    <p className="text-xl ml-2">Email</p>
                    <div className="join w-full">
                        <div className="w-full max-w-2xl">
                            <input className="input input-bordered join-item w-full bg-gray-300 border-none focus:outline-none" value={email} onChange={handleEmailEdited} />
                        </div>

                        <div className="indicator">
                            <button disabled={!emailEdited} className="btn join-item bg-gray-300 disabled:text-gray-200 border-none">Save</button>
                        </div>
                    </div>
                </div>

                <div>
                    <p className="text-xl ml-2">Password</p>
                    <div className="join w-full">
                        <div className="w-full max-w-2xl">
                            <input className="input input-bordered join-item w-full bg-gray-300 border-none focus:outline-none" placeholder="Edit Password" value={password} onChange={handlePasswordEdited} />
                        </div>

                        <div className="indicator">
                            <button disabled={!passwordEdited} className="btn join-item bg-gray-300 disabled:text-gray-200 border-none">Save</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserPage;