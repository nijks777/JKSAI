"use client"
import Link from "next/link"
import { sideBarOptions } from "@/services/Constants"
import { usePathname } from "next/navigation"
import UserMenu from "./UserMenu"

export function AppHeader() {
    const path = usePathname();

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-full mx-auto px-6 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex-shrink-0">
                        <img
                            src="/logo.png"
                            alt="Logo"
                            width={150}
                            height={60}
                            className="h-10 w-auto"
                        />
                    </Link>

                    {/* Navigation Menu */}
                    <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
                        {sideBarOptions.map((option, index) => (
                            <Link key={index} href={option.path}>
                                <div className={`
                                    flex items-center gap-2 px-4 py-2 rounded-lg
                                    cursor-pointer transition-all
                                    ${path === option.path
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'hover:bg-primary/10 text-foreground'
                                    }
                                `}>
                                    <option.icon className="h-4 w-4" />
                                    <span className="text-sm font-medium">{option.name}</span>
                                </div>
                            </Link>
                        ))}
                    </nav>

                    {/* Right Section: User Menu */}
                    <div className="flex items-center gap-4">
                        {/* User Menu Component */}
                        <UserMenu />
                    </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="md:hidden flex items-center gap-2 mt-3 overflow-x-auto pb-2">
                    {sideBarOptions.map((option, index) => (
                        <Link key={index} href={option.path}>
                            <div className={`
                                flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap
                                cursor-pointer transition-all
                                ${path === option.path
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'hover:bg-primary/10 text-foreground'
                                }
                            `}>
                                <option.icon className="h-4 w-4" />
                                <span className="text-sm font-medium">{option.name}</span>
                            </div>
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    )
}
