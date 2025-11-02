"use client"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
  } from "@/components/ui/sidebar"
  import { Button } from '@/components/ui/button'
    import { Plus, LogOut } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { sideBarOptions } from "@/services/Constants"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/services/supabaseClient"
import { toast } from "sonner"
  export function AppSidebar() {
    const path=usePathname();
    const router = useRouter();
    console.log(path);

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
      <Sidebar>
        <SidebarHeader className='flex items-center mt-5 px-4' >
            <img src="/logo.png" alt="Logo" width={200} height={100} className="w-full max-w-[180px] mx-auto"/>
            <Link href="/dashboard/Create-interview" className="w-full">
              <Button className='w-full mt-6 cursor-pointer h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all' >
              <Plus className="mr-2 h-5 w-5" />
              Create New Interview
             </Button>
            </Link>
        </SidebarHeader >

        <SidebarContent className="px-3 mt-4">
          <SidebarGroup >
            <SidebarContent>
                <SidebarMenu className="space-y-2">
                    {sideBarOptions.map((option,index)=>(
                      <SidebarMenuItem key={index}>
                        <Link href={option.path} className="w-full">
                          <div className={`
                            flex items-center gap-3 w-full py-3 px-4 rounded-lg
                            cursor-pointer transition-all
                            ${path==option.path
                              ? 'bg-primary text-primary-foreground shadow-md'
                              : 'hover:bg-primary/10 text-foreground'
                            }
                          `}>
                            <option.icon className="h-5 w-5" />
                            <span className="text-base font-medium">{option.name}</span>
                          </div>
                        </Link>
                      </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
          </SidebarGroup>
          <SidebarGroup />
        </SidebarContent>
        <SidebarFooter className='p-4 mt-auto'>
          <Button
            variant="outline"
            className='w-full cursor-pointer h-12 text-base font-semibold border-2 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all'
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </Button>
        </SidebarFooter>
      </Sidebar>
    )
  }
  