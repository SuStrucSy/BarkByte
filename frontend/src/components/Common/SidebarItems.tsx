import { useQueryClient } from "@tanstack/react-query"
import { Link as RouterLink } from "@tanstack/react-router"

//import type { UserPublic } from "@/client"
import { Home, Settings, Users, type LucideIcon } from 'lucide-react'
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'

const items = [
  { icon: Home, title: "Dashboard", path: "/" },
  { icon: Settings, title: "User Settings", path: "/settings" },
]

interface SidebarItemsProps {
  onClose?: () => void
}

interface Item {
  icon: LucideIcon
  title: string
  path: string
}

const SidebarItems = ({ onClose }: SidebarItemsProps) => {
  const queryClient = useQueryClient()
  //const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])
  const currentUser = null

  const finalItems: Item[] = currentUser?.is_superuser
    ? [...items, { icon: Users, title: "Admin", path: "/admin" }]
    : items

  const listItems = finalItems.map((item) => (
    <RouterLink key={item.title} to={item.path} onClick={onClose}>
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton tooltip={item.title}>
          {item.icon && <item.icon />}
          <span>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </RouterLink>
  ))

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        Menu
      </SidebarGroupLabel>
      <SidebarMenu>{listItems}</SidebarMenu>
    </SidebarGroup>
  )
}

export default SidebarItems
