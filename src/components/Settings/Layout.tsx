import { Outlet } from "react-router-dom";
import { IoPersonSharp } from "react-icons/io5";
import { BiSolidBookmark } from "react-icons/bi";
import { HiChatBubbleOvalLeft } from "react-icons/hi2";

const SettingsLayout = () => {
    return (
        <div className="p-8 px-12 space-y-14 h-full">
            <div role="tablist" className="tabs tabs-boxed">
                <div role='tab' className="tab tab-active space-x-1">
                    <p className="text-lg"><IoPersonSharp /></p>

                    <p>Account</p>
                </div>
                <div role='tab' className="tab space-x-1 text-gray-400">
                    <p className="text-lg"><HiChatBubbleOvalLeft /></p>

                    <p>All Chats</p>
                </div>
                <div role='tab' className="tab space-x-1 text-gray-400">
                    <p className="text-lg"><BiSolidBookmark /></p>

                    <p>Saved</p>
                </div>
            </div>            

            <Outlet />
        </div>
    )
}

export default SettingsLayout;