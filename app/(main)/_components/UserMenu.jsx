"use client"
import React, { useState, useRef, useEffect } from 'react'
import { LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/services/supabaseClient"
import { toast } from "sonner"
import { useUser } from '@/app/provider'

function UserMenu() {
    const { user } = useUser() || { user: null };
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const router = useRouter();

    // Get user's first character (first letter of name)
    const getUserInitial = () => {
        if (!user?.name) return 'U';
        return user.name.charAt(0).toUpperCase();
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            toast.success("Logged out successfully");
            router.push('/auth');
        } catch (error) {
            console.error('Error logging out:', error.message);
            toast.error("Failed to logout");
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* User Avatar Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-semibold text-lg hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all cursor-pointer"
                aria-label="User menu"
            >
                {getUserInitial()}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-semibold text-lg">
                                {getUserInitial()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {user?.name || 'Guest User'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {user?.email || 'No email'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                        {/* Profile Option (Optional - can be added later) */}
                        <button
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => {
                                setIsOpen(false);
                                // Add profile navigation if needed
                            }}
                        >
                            <User className="h-4 w-4" />
                            <span>My Profile</span>
                        </button>

                        {/* Logout Button */}
                        <button
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            onClick={() => {
                                setIsOpen(false);
                                handleLogout();
                            }}
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UserMenu
