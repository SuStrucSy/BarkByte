import { Link as RouterLink, useLocation } from "@tanstack/react-router";

import {
  ChartSpline,
  Columns3,
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
  { icon: Newspaper, title: "References", path: "/references" },
  { icon: Columns3, title: "Compare", path: "/compare" },
];

const groupTwoItems = [{ icon: Layers, title: "All", path: "/specimens" }];

interface Item {
  icon: LucideIcon;
  title: string;
  path: string;
}

const SidebarItems = () => {
  const { data: currentUser } = useCurrentUser();
  const { pathname } = useLocation();

  const specimenItems: Item[] = currentUser
    ? [
        ...groupTwoItems,
        { icon: LayersPlus, title: "Add", path: "/specimens/new" },
        {
          icon: ListTodo,
          title: "Pending",
          path: "/specimens/pending",
        },
      ]
    : groupTwoItems;

  const adminItems: Item[] = currentUser?.is_superuser
    ? [{ icon: Users, title: "Users Management", path: "/admin" }]
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

  const specimenMenuItems = specimenItems.map((item) => (
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

  const adminMenuItems = adminItems.map((item) => (
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
        <SidebarMenu>{specimenMenuItems}</SidebarMenu>
      </SidebarGroup>
      {currentUser?.is_superuser ? (
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarMenu>{adminMenuItems}</SidebarMenu>
        </SidebarGroup>
      ) : null}
    </>
  );
};

export default SidebarItems;
