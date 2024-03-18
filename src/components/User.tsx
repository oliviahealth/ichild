import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "react-router-dom";

import useAppStore from "../stores/useAppStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "react-query";
import { IUser, UserSchema } from "../utils/interfaces";
import axios, { AxiosError } from "axios";
import parseWithZod from "../utils/parseWithZod";

const UserPage: React.FC = () => {
    const navigate = useNavigate();
    const setError = useAppStore(state => state.setError);

    const user = useAppStore(state => state.user);
    const setUser = useAppStore(state => state.setUser);
    
    const accessToken = useAppStore(state => state.accessToken);

    const [errorDetected, setErrorDetected] = useState(false);

    const editUserDetailsSchema = z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email().min(1, 'Email is required'),
        password: z.string().optional(),
    });
    type EditUserDetailsFromData = z.infer<typeof editUserDetailsSchema>;

    let { register: registerUserDetails, setValue, control, handleSubmit, formState: { errors } } = useForm<EditUserDetailsFromData>({ resolver: zodResolver(editUserDetailsSchema), defaultValues: { name: user?.name, email: user?.email } })
    const nameValue = useWatch({ control, name: 'name' });
    const emailValue = useWatch({ control, name: 'email' });
    const passwordValue = useWatch({ control, name: 'password' });

    const { mutate: editUserDetails, isLoading } = useMutation(async (data: EditUserDetailsFromData) => {
        const headers = {
            "OliviaAuthorization": "Bearer " + accessToken,
            "userId": user?.id,
        }

        if(passwordValue) {
            const confirmPasswordValue = prompt("Confirm Password");

            if(confirmPasswordValue !== passwordValue) {        
                throw new Error("Passwords must match");
            }
        }

        const updatedUser: IUser = (await axios.put(`${import.meta.env.VITE_API_URL}/updateuser`, data, { headers: { ...headers }, withCredentials: true })).data;

        parseWithZod(updatedUser, UserSchema);

        return updatedUser;
    }, {
        onSuccess: (response) => {
            if(!response) return;

            setUser(response);
        },
        onError: (error: AxiosError) => {
            if(error.request.status === 403) {
                navigate('/signin')
            }
            
            setError(error.message);
            setErrorDetected(true)
        },
        onSettled: () => setValue('password', undefined)
    });

    return (
        <>
            <div className="space-y-1">
                {errorDetected && (<p className="text-sm text-red-500">Something went wrong. Please try again</p>)}

                <h1 className="text-5xl">Account</h1>
                <p className="text-xl">Manage your account settings</p>
            </div>

            <form onSubmit={handleSubmit((data) => editUserDetails(data))} className="h-full space-y-10">
                <div>
                    <p className="text-xl ml-2">Name</p>
                    <div className="join w-full">
                        <div className="w-full max-w-2xl">
                            <input {...registerUserDetails('name')} className="input input-bordered join-item w-full bg-neutral-200 border-none focus:outline-none" />
                            {errors.name && <span className="label-text-alt text-red-500">{errors.name.message}</span>}
                        </div>

                        <div className="indicator">
                            <button disabled={nameValue === user?.name} className="btn join-item bg-primary text-white disabled:text-neutral-400 disabled:bg-neutral-200 hover:bg-neutral-400 border-none">{ isLoading && nameValue !== user?.name ? <span className="loading loading-spinner loading-sm"></span> : "Save" }</button>
                        </div>
                    </div>
                </div>

                <div>
                    <p className="text-xl ml-2">Email</p>
                    <div className="join w-full">
                        <div className="w-full max-w-2xl">
                            <input {...registerUserDetails('email')} className="input input-bordered join-item w-full bg-neutral-200 border-none focus:outline-none" />
                            {errors.email && <span className="label-text-alt text-red-500">{errors.email.message}</span>}
                        </div>

                        <div className="indicator">
                            <button disabled={emailValue === user?.email} className="btn join-item bg-primary text-white disabled:text-neutral-400 disabled:bg-neutral-200 hover:bg-neutral-400 border-none">{ isLoading && emailValue !== user?.email ? <span className="loading loading-spinner loading-sm"></span> : "Save" }</button>
                        </div>
                    </div>
                </div>


                <div>
                    <p className="text-xl ml-2">Password</p>
                    <div className="join w-full">
                        <div className="w-full max-w-2xl">
                            <input type="password" {...registerUserDetails('password')} className="input input-bordered join-item w-full bg-neutral-200 border-none focus:outline-none" placeholder="Edit Password" />
                            {errors.password && <span className="label-text-alt text-red-500">{errors.password.message}</span>}
                        </div>

                        <div className="indicator">
                            <button disabled={!passwordValue} className="btn join-item bg-primary text-white disabled:text-neutral-400 disabled:bg-neutral-200 hover:bg-neutral-400 border-none">{ isLoading && passwordValue ? <span className="loading loading-spinner loading-sm"></span> : "Save" }</button>
                        </div>
                    </div>
                </div>
            </form>
        </>
    )
}

export default UserPage;