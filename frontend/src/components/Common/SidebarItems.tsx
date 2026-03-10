import { Link as RouterLink, useLocation } from "@tanstack/react-router";

import {
  ChartSpline,
  Home,
  Layers,
  LayersPlus,
  ListTodo,
  type LucideIcon,
  Newspaper,
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

  { icon: Newspaper, title: "References", path: "/dois" },
];

const specimenMenuItems = [
  { icon: Layers, title: "Specimens", path: "/specimens" },
  { icon: LayersPlus, title: "Add Specimen", path: "/specimens/new" },
  { icon: ListTodo, title: "Pending Specimens", path: "/specimens/pending" },
];

interface Item {
  icon: LucideIcon;
  title: string;
  path: string;
}

const SidebarItems = () => {
  const { data: currentUser } = useCurrentUser();
  const { pathname } = useLocation();

  const adminMenuItems: Item[] = currentUser?.is_superuser
    ? [{ icon: Users, title: "User Management", path: "/admin" }]
    : [];

  const listItems = items.map((item) => (
    <RouterLink key={item.title} to={item.path}>
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          tooltip={item.title}
          className="cursor-pointer data-[active=true]:font-bold"
          isActive={item.path === pathname}
        >
          {item.icon && <item.icon />}
          <span>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </RouterLink>
  ));

  const specimentItems = specimenMenuItems.map((item) => (
    <RouterLink key={item.title} to={item.path}>
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          tooltip={item.title}
          className="cursor-pointer data-[active=true]:font-bold"
          isActive={item.path === pathname}
        >
          {item.icon && <item.icon />}
          <span>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </RouterLink>
  ));

  const adminItems = adminMenuItems.map((item) => (
    <RouterLink key={item.title} to={item.path}>
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          tooltip={item.title}
          className="cursor-pointer data-[active=true]:font-bold"
          isActive={item.path === pathname}
        >
          {item.icon && <item.icon />}
          <span>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </RouterLink>
  ));

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Menu</SidebarGroupLabel>
        <SidebarMenu>{listItems}</SidebarMenu>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Specimen</SidebarGroupLabel>
        <SidebarMenu>{specimentItems}</SidebarMenu>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Admin</SidebarGroupLabel>
        <SidebarMenu>{adminItems}</SidebarMenu>
      </SidebarGroup>
    </>
  );
};

export default SidebarItems;
