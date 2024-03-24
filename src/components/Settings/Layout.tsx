import { Navigate, Outlet } from "react-router-dom";
import useAppStore from "../../stores/useAppStore";

const SettingsLayout = () => {
    const user = useAppStore((state) => state.user);
    
    return (
        <div className="p-8 px-12 space-y-14 h-full">
            { user ? <Outlet /> : <Navigate  to={'/signin'}/>}
        </div>
    )
}

export default SettingsLayout;