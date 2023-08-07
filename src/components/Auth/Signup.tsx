import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import useAppStore from "../../stores/useAppStore";
import parseWithZod from "../../utils/parseWithZod";
import fetchWithAxios from "../../utils/fetchWithAxios";
import { UserSchema, IUser } from "../../utils/interfaces";

const Auth: React.FC = () => {
    const navigate = useNavigate();

    const setUser = useAppStore((state) => state.setUser);

    // Use zod to validate the form before submission
    // https://zod.dev/
    const signupSchema = z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email().min(1, 'Email is required'), // Example: If the user does not enter email and tries to submit the formm, they'll get an error message of 'Email is required'
        password: z.string().min(1, 'Password is required'),
        confirmPassword: z.string().min(1, 'Confirm password is required')
    }).refine((data) => data.password === data.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Passwords must match'
    });
    type SignupFormData = z.infer<typeof signupSchema>; // Create the type from Zod inference

    // Use React-Hook-Form to handle form state and submission
    // https://www.react-hook-form.com/
    let { register: registerSignup, handleSubmit: handleSignup, formState: { errors: signupErrors } } = useForm<SignupFormData>({ resolver: zodResolver(signupSchema) });

    const { mutate: signupUser, isLoading } = useMutation(async (data: SignupFormData) => {
        const user: IUser = await fetchWithAxios(`${import.meta.env.VITE_API_URL}/signup`, 'POST', data);

        parseWithZod(user, UserSchema);

        return user
    }, {
        onSuccess: (user) => {
            if (user) {
                setUser(user);
                return navigate("/")
            }
        }
    })

    return (
        <>
            <div>
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