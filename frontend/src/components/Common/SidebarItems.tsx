import { Link as RouterLink, useLocation } from "@tanstack/react-router";

import {
  ChartSpline,
  Home,
  Layers,
  type LucideIcon,
  Newspaper,
  Settings,
  Users,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const items = [
  { icon: Home, title: "Home", path: "/" },
  { icon: ChartSpline, title: "Dashboard", path: "/dashboard" },
  { icon: Layers, title: "Specimens", path: "/specimens" },
  { icon: Newspaper, title: "References", path: "/dois" },
  { icon: Settings, title: "User Settings", path: "/settings" },
];

interface Item {
  icon: LucideIcon;
  title: string;
  path: string;
}

const SidebarItems = () => {
  const { data: currentUser } = useCurrentUser();
  const { pathname } = useLocation();

  const finalItems: Item[] = currentUser?.is_superuser
    ? [...items, { icon: Users, title: "Admin", path: "/admin" }]
    : items;

  const listItems = finalItems.map((item) => (
    <RouterLink key={item.title} to={item.path}>
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          tooltip={item.title}
          className="cursor-pointer"
          isActive={item.path === pathname}
        >
          {item.icon && <item.icon />}
          <span>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </RouterLink>
  ));

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>{listItems}</SidebarMenu>
    </SidebarGroup>
  );
};

export default SidebarItems;
