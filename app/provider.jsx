"use client"
import React, { useContext, useEffect, useState } from 'react'
import { supabase } from '@/services/supabaseClient'
import { UserDetailContext } from '@/context/UserDetailContext';

function Provider({ children }) {
    const [user, setUser] = useState();

    useEffect(() => {
        createNewUser();
    }, [])

    const createNewUser = () => {
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (!user) return;

            // Check if user already exists
            let { data: Users, error } = await supabase
                .from('Users')
                .select("*")
                .eq('email', user?.email);
            
            console.log(Users);
            
            if (!Users || Users.length == 0) {
                const { data, error } = await supabase
                    .from("Users")
                    .insert([{
                        name: user?.user_metadata?.full_name,
                        email: user?.email,
                        picture: user?.user_metadata?.picture,
                    }]);
                
                console.log(data);
                setUser(data);
                return;
            }
            
            setUser(Users[0]);
        })
    }

    return (
        <UserDetailContext.Provider value={{ user, setUser }}>
            {children}
        </UserDetailContext.Provider>
    )
}

export default Provider

export const useUser = () => {
    const context = useContext(UserDetailContext);
    if (context === null) {
        return { user: null, setUser: () => {} };
    }
    return context;
}