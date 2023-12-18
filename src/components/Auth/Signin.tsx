import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import useAppStore from "../../stores/useAppStore";
import parseWithZod from "../../utils/parseWithZod";
import { UserSchema, IUser } from "../../utils/interfaces";


const Signin: React.FC = () => {
    const navigate = useNavigate();

    const setUser = useAppStore((state) => state.setUser);
    const [errorDetected, setErrorDetected] = useState(false);

    // Use zod to validate the form before submission
    // https://zod.dev/
    const signinSchema = z.object({
        email: z.string().email().min(1, 'Email is required'), // Example: If the user does not enter email and tries to submit the formm, they'll get an error message of 'Email is required'
        password: z.string().min(1, 'Password is required')
    });
    type SigninFormData = z.infer<typeof signinSchema>; // Create the type from Zod inference

    // Use React-Hook-Form to handle form state and submission
    // https://www.react-hook-form.com/
    let { register: registerSignin, handleSubmit: handleSignin, formState: { errors: signinErrors } } = useForm<SigninFormData>({ resolver: zodResolver(signinSchema) });

    const { mutate: signinUser, isLoading } = useMutation(async (data: SigninFormData) => {
        const user: IUser = (await axios.post(`${import.meta.env.VITE_API_URL}/signin`, data, { withCredentials: true })).data;

        parseWithZod(user, UserSchema);

        return user
    }, {
        onSuccess: (user) => {
            if (user) {
                setUser(user)
                return navigate('/')
            }
        },
        onError: () => setErrorDetected(true)
    })

    return (
        <>
            <div>
                <p className="font-semibold text-2xl">Welcome Back!</p>
                <p className="text-sm">Sign in to your account</p>

                { errorDetected && (<p className="text-sm text-red-500">Something went wrong. Please try again</p>) }
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