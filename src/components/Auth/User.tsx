import React from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useMutation } from "react-query";
import axios from "axios";

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
        <>
            <div>
                <p className="font-semibold text-2xl">Sign Out</p>
                <p className="text-sm">Sign out of your account</p>
            </div>

            <div className="w-full">
                <button className="btn btn-primary w-full mt-6" disabled={isLoading} onClick={() => signoutUser()}>
                    {isLoading && (<span className="loading loading-spinner loading-sm"></span>)}
                    Sign Out
                </button>
            </div>
        </>
    )
}

export default User