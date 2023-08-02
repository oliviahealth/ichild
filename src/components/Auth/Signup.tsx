import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import useAppStore from "../../stores/useAppStore";
import { UserSchema, IUser } from "../../utils/interfaces";

const Auth: React.FC = () => {
    const navigate = useNavigate();

    const [error, setError] = useState<null | string>(null);

    const setUser = useAppStore((state) => state.setUser);

    const signupSchema = z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email().min(1, 'Email is required'),
        password: z.string().min(1, 'Password is required'),
        confirmPassword: z.string().min(1, 'Confirm password is required')
    }).refine((data) => data.password === data.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Passwords must match'
    });
    type SignupFormData = z.infer<typeof signupSchema>;

    let { register: registerSignup, handleSubmit: handleSignup, formState: { errors: signupErrors } } = useForm<SignupFormData>({ resolver: zodResolver(signupSchema) });

    const { mutate: signupUser, isLoading } = useMutation(async (data: SignupFormData) => {
        try {
            const user: IUser = await (await axios.post(`${import.meta.env.VITE_API_URL}/signup`, data, { withCredentials: true })).data

            if (!(await UserSchema.safeParseAsync(user)).success) {
                return alert("Something went wrong!");
            }

            setUser(user);

            return navigate('/')
        } catch (err: any) {
            const { error } = err.response.data ?? "Something went wrong!"
            setError(error);
        }
    })

    return (
        <>
            <div>
                <p className="text-sm text-red-500 mb-4">{error}</p>
                <p className="font-semibold text-2xl">Get Started</p>
                <p className="text-sm">Create your account now</p>
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

            <form onSubmit={handleSignup((data) => signupUser(data))} className="form-control w-full">
                <div className="my-1">
                    <label className="label">
                        <span className="label-text text-black font-medium">Name</span>
                    </label>
                    <input {...registerSignup('name')} type="text" className="input w-full border-gray-200 focus:border-primary focus:outline-none" />
                    {signupErrors.name && <span className="label-text-alt text-red-500">{signupErrors.name.message}</span>}
                </div>

                <div className="my-1">
                    <label className="label">
                        <span className="label-text text-black font-medium">Email</span>
                    </label>
                    <input {...registerSignup('email')} type="email" className="input w-full border-gray-200 focus:border-primary focus:outline-none" />
                    {signupErrors.email && <span className="label-text-alt text-red-500">{signupErrors.email.message}</span>}
                </div>

                <div className="my-1">
                    <label className="label">
                        <span className="label-text text-black font-medium">Password</span>
                    </label>
                    <input {...registerSignup('password')} type="password" className="input w-full border-gray-200 focus:border-primary focus:outline-none" />
                    {signupErrors.password && <span className="label-text-alt text-red-500">{signupErrors.password.message}</span>}
                </div>

                <div className="my-1">
                    <label className="label">
                        <span className="label-text text-black font-medium">Confirm Password</span>
                    </label>
                    <input {...registerSignup('confirmPassword')} type="password" className="input w-full border-gray-200 focus:border-primary focus:outline-none" />
                    {signupErrors.confirmPassword && <span className="label-text-alt text-red-500">{signupErrors.confirmPassword.message}</span>}
                </div>

                <button className="btn btn-primary w-full mt-6" disabled={isLoading}>
                    {isLoading && (<span className="loading loading-spinner loading-sm"></span>)}
                    Sign Up
                </button>
            </form>

            <p className="text-sm mt-8">Have an account? <span className="text-primary"><Link to={'/signin'}>Sign In</Link></span></p>
        </>
    )
}

export default Auth;