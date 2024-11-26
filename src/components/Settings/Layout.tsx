import {  Outlet } from "react-router-dom";

const SettingsLayout = () => {
    
    return (
        <div className="p-8 px-12 space-y-14 h-full">

            <Outlet />
        </div>
    )
}

export default SettingsLayout;