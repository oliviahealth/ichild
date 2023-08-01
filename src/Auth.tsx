import React from "react";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const Auth: React.FC = () => {
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

    const signupUser: SubmitHandler<SignupFormData> = (data) => {
        console.log(data);
    }

    return (
        <div className="flex flex-col justify-between text-black h-screen">
            <div className="shadow-2xl bg-white">
                <Navbar />
            </div>

            <div className="w-full mx-auto flex h-full">
                <div className="w-full lg:w-1/2 flex justify-center items-center">
                    <div className="sm:w-3/5 sm:container">
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

                        <form onSubmit={handleSignup(signupUser)} className="form-control w-full">
                            <div className="my-1">
                                <label className="label">
                                    <span className="label-text text-black font-medium">Name</span>
                                </label>
                                <input { ...registerSignup('name') } type="text" className="input w-full border-gray-200 focus:border-primary focus:outline-none" />
                                {signupErrors.name && <span className="label-text-alt text-red-500">{signupErrors.name.message}</span>}
                            </div>

                            <div className="my-1">
                                <label className="label">
                                    <span className="label-text text-black font-medium">Email</span>
                                </label>
                                <input { ...registerSignup('email') } type="email" className="input w-full border-gray-200 focus:border-primary focus:outline-none" />
                                {signupErrors.email && <span className="label-text-alt text-red-500">{signupErrors.email.message}</span>}
                            </div>

                            <div className="my-1">
                                <label className="label">
                                    <span className="label-text text-black font-medium">Password</span>
                                </label>
                                <input { ...registerSignup('password') } type="password" className="input w-full border-gray-200 focus:border-primary focus:outline-none" />
                                {signupErrors.password && <span className="label-text-alt text-red-500">{signupErrors.password.message}</span>}
                            </div>

                            <div className="my-1">
                                <label className="label">
                                    <span className="label-text text-black font-medium">Confirm Password</span>
                                </label>
                                <input { ...registerSignup('confirmPassword') } type="password" className="input w-full border-gray-200 focus:border-primary focus:outline-none" />
                                {signupErrors.confirmPassword && <span className="label-text-alt text-red-500">{signupErrors.confirmPassword.message}</span>}
                            </div>

                            <button className="btn btn-primary w-full mt-6">Sign Up</button>
                        </form>
                    </div>
                </div>

                <div className="hidden lg:block w-1/2 bg-[url('../assets/loginBackground.png')]">
                    {/* <img src={loginBackground} className="w-full object-fill" /> */}
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default Auth;