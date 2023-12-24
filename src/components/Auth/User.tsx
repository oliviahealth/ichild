import React from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useMutation } from "react-query";
import axios from "axios";

import Navbar from "../Navbar";
import { BsFillPersonFill, BsChatFill } from "react-icons/bs";
import { BiSolidBookmark } from "react-icons/bi";

import useAppStore from "../../stores/useAppStore";

const User: React.FC = () => {
    const navigate = useNavigate();

    const user = useAppStore((state) => state.user);
    const setUser = useAppStore((state) => state.setUser);

    const accessToken = useAppStore((state) => state.accessToken);
    const setAccessToken = useAppStore((state) => state.setAccessToken);

    const { mutate: signoutUser, isLoading } = useMutation(async () => {
        const headers = {
            "Authorization": "Bearer " + accessToken,
            "userId": user?.id,
        };

        await axios.post(`${import.meta.env.VITE_API_URL}/signout`, null, { headers: { ...headers }, withCredentials: true });
    }, {
        onSuccess: () => {
            setAccessToken(null);
            setUser(null);

            sessionStorage.clear();

            return navigate('/signin')
        }
    });

    if (!user) {
        return <>
            <Navigate to={"/signin"} replace={true} />
        </>
    }

    return (
        <div className="h-screen">
            <div className="flex flex-col h-full text-black bg-[url('../assets/background.png')] bg-cover">
                <div className="shadow-2xl bg-white">
                    <Navbar />
                </div>

                <div className="w-full xl:container mx-auto h-full m-2">
                    <div className="flex h-full bg-opacity-80 bg-gray-100 rounded-box">
                        {/* Left Container - 1/4 of the screen */}
                        <div className="w-1/5 px-8 pt-10 space-y-4">
                            <Link to={"/"} className={`flex gap-8 my-2 p-3 text-sm rounded-lg cursor-pointer items-center bg-neutral-100 hover:bg-gray-200`}>
                                <BsFillPersonFill />

                                <p className="font-bold">Account</p>                       
                            </Link>

                            <Link to={"/"} className={`flex gap-8 my-2 p-3 text-sm rounded-lg cursor-pointer items-center  hover:bg-gray-200`}>
                                <BsChatFill />

                                <p>Chats</p>                       
                            </Link>

                            <Link to={"/"} className={`flex gap-8 my-2 p-3 text-sm rounded-lg cursor-pointer items-center  hover:bg-gray-200`}>
                                <BiSolidBookmark />

                                <p>Saved</p>                       
                            </Link>
                        </div>

                        <div className="w-1 bg-gray-300"></div>

                        {/* Right Container - 3/4 of the screen */}
                        <div className="w-4/5 px-8 pt-10 space-y-20">
                            <div className="space-y-2">
                                <h1 className="text-5xl">Account</h1>
                                <p className="text-xl">Manage your account settings</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <p className="text-2xl font-medium">Name</p>
                                    <label className="form-control w-full max-w-xl">
                                        <input type="text" value={user.name} className="input input-bordered w-full max-w-xl" />
                                        <div className="label">
                                            <span className="label-text-alt ml-auto">Save</span>
                                        </div>
                                    </label>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-2xl font-medium">Email</p>
                                    <label className="form-control w-full max-w-xl">
                                        <input type="text" value={user.email} className="input input-bordered w-full max-w-xl" />
                                        <div className="label">
                                            <span className="label-text-alt ml-auto">Save</span>
                                        </div>
                                    </label>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-2xl font-medium">Password</p>
                                    <label className="form-control w-full max-w-xl">
                                        <input type="password" value={user.email} className="input input-bordered w-full max-w-xl" />
                                        <div className="label">
                                            <span className="label-text-alt ml-auto">Save</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    )
}

export default User