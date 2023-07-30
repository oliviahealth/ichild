import React, { useEffect } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

import useAppStore from "../stores/useAppStore";
import supabase from "../utils/supabase";

const AuthComponent: React.FC = () => {
    const session = useAppStore((state) => state.session);
    const setSession = useAppStore((state) => state.setSession);

    useEffect(() => {
        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        })
    }, [])

    if (!session) {
        return (
            <div className="w-full h-full flex justify-center items-center bg-neutral">
                <div>
                    <Auth
                        supabaseClient={supabase}
                        appearance={{ theme: ThemeSupa }}
                        providers={["google"]}
                    />
                </div>
            </div>
        );
    }

    return (
        <div>
            <div>Logged in!</div>
            <button onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
    );
}

export default AuthComponent;