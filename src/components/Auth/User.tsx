import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useMutation } from "react-query";
import axios from "axios";

import useAppStore from "../../stores/useAppStore";

const User: React.FC = () => {
    const navigate = useNavigate();

    const [error, setError] = useState<null | string>(null);

    const user = useAppStore((state) => state.user);
    const setUser = useAppStore((state) => state.setUser);

    const { mutate: signoutUser, isLoading } = useMutation(async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/signout`, null, { withCredentials: true });

            setUser(null);

            navigate('/')
        } catch(err: any) {
            const { error } = err.response.data || "Something went wrong!"
            setError(error);
        }
    });
    
    const handleSignOut = (evt: React.FormEvent<HTMLFormElement>) => {
        evt.preventDefault();

        signoutUser();
    }

    if(!user) {
        return <>
            <Navigate to={"/signin"} replace={true} />
        </>
    }

    return (
        <>
            <div>
                <p className="text-sm text-red-500 mb-4">{error}</p>
                <p className="font-semibold text-2xl">Sign Out</p>
                <p className="text-sm">Sign out of your account</p>
            </div>

            <form className="form-control w-full" onSubmit={handleSignOut}>
                <button className="btn btn-primary w-full mt-6" disabled={isLoading}>
                    {isLoading && (<span className="loading loading-spinner loading-sm"></span>)}
                    Sign Out
                </button>
            </form>
        </>
    )
}

export default User