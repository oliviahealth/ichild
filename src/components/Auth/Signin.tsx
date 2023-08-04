import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import useAppStore from "../../stores/useAppStore";
import { UserSchema, IUser } from "../../utils/interfaces";


const Signin: React.FC = () => {
    const navigate = useNavigate();

    const [error, setError] = useState<null | string>(null);

    const setUser = useAppStore((state) => state.setUser);

    const signinSchema = z.object({
        email: z.string().email().min(1, 'Email is required'),
        password: z.string().min(1, 'Password is required')
    });
    type SigninFormData = z.infer<typeof signinSchema>;

    let { register: registerSignin, handleSubmit: handleSignin, formState: { errors: signinErrors } } = useForm<SigninFormData>({ resolver: zodResolver(signinSchema) });

    const { mutate: signinUser, isLoading } = useMutation(async (data: SigninFormData) => {
        try {
            const user: IUser = await (await axios.post(`${import.meta.env.VITE_API_URL}/signin`, data, { withCredentials: true })).data

            if(!(await UserSchema.safeParseAsync(user)).success) {
                return alert("Something went wrong");
            }

            setUser(user);

            return navigate('/');
        } catch (err: any) {
            const { error } = err.response.data || "Something went wrong!"
            setError(error);
        }
    })

    return (
        <>
            <div>
                <p className="text-sm text-red-500 mb-4">{error}</p>
                <p className="font-semibold text-2xl">Welcome Back!</p>
                <p className="text-sm">Sign in to your account</p>
            </div>

            <button className="w-full my-4 px-4 py-2 border flex justify-center gap-2 border-slate-200 rounded-lg text-slate-700 hover:border-slate-400 hover:text-slate-900 hover:shadow transition duration-150">
                <img className="w-6 h-6" src="https://www.svgrepo.com/show/475656/google-color.svg" loading="lazy" alt="google logo" />
                <span>Sign in with Google</span>
            </button>

            <div className="flex items-center py-4">
                <div className="flex-grow h-px bg-gray-400"></div>

                <span className="text-xs text-gray-500 px-4 font-light">or</span>

                <div className="flex-grow h-px bg-gray-400"></div>
            </div>

            <form onSubmit={handleSignin((data) => signinUser(data))} className="form-control w-full">
                <div className="my-1">
                    <label className="label">
                        <span className="label-text text-black font-medium">Email</span>
                    </label>
                    <input {...registerSignin('email')} type="email" className="input w-full border-gray-200 focus:border-primary focus:outline-none" />
                    {signinErrors.email && <span className="label-text-alt text-red-500">{signinErrors.email.message}</span>}
                </div>

                <div className="my-1">
                    <label className="label">
                        <span className="label-text text-black font-medium">Password</span>
                    </label>
                    <input {...registerSignin('password')} type="password" className="input w-full border-gray-200 focus:border-primary focus:outline-none" />
                    {signinErrors.password && <span className="label-text-alt text-red-500">{signinErrors.password.message}</span>}
                </div>

                <button className="btn btn-primary w-full mt-6" disabled={isLoading}>
                    {isLoading && (<span className="loading loading-spinner loading-sm"></span>)}
                    Sign In
                </button>
            </form>

            <p className="text-sm mt-8">Don't have an account? <span className="text-primary"><Link to={'/signup'}>Sign Up</Link></span></p>
        </>
    )
}

export default Signin;