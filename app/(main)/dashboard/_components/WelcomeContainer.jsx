"use client"
import React from 'react'
import { useUser } from '@/app/provider';

function WelcomeContainer() {
    const { user } = useUser() || { user: null };
    
    return (
        <div className='bg-white p-5 rounded-xl flex justify-between items-center'>
            <div >
                <h2 className='text-lg font-bold'>Welcome Back, {user?.name || 'Guest'}</h2>
                <h2 className='text-gray-500'>Enhance Your Interview Skills</h2>
            </div>
         {user&&<img src={user?.picture} alt="User Profile" width={50} height={50} className='rounded-full mt-5' />}
        </div>
    )
}

export default WelcomeContainer