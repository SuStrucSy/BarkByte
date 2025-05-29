import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

// import type { UserPublic } from "@/client"
// import useAuth from "@/hooks/useAuth"
import { NavUser } from './NavUser'
import { ArrowUpCircleIcon } from 'lucide-react'
import SidebarItems from './SidebarItems'

const AppSidebar = () => {
  const queryClient = useQueryClient()
  //const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])
  //const { logout } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">BarkByte</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarItems />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
          name: "shadcn",
          email: "m@example.com",
          avatar: "/avatars/shadcn.jpg",
        }}/>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
