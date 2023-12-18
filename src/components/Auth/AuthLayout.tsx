import { Outlet } from "react-router-dom";

import Navbar from "../Navbar";
import Footer from "../Footer";
import ErrorComponent from "../ErrorComponent";

const AuthLayout = () => {
    return (
        <div className="flex flex-col justify-between text-black h-screen">
            <div className="bg-white">
                <Navbar />
            </div>

            <ErrorComponent />

            <div className="w-full mx-auto flex h-full">
                <div className="w-full flex justify-center items-center bg-[url('src/assets/authBackground.png')] lg:bg-none">
                    <div className="w-full p-8 m-auto sm:w-3/5 sm:max-w-2xl rounded-lg sm:rounded-none bg-white bg-opacity-90">
                        <Outlet />
                    </div>

                    <div className="hidden h-full lg:block w-1/2 bg-[url('src/assets/authBackground.png')]">
                        
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default AuthLayout;