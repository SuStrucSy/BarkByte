import { useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink, useLocation } from "@tanstack/react-router";

import { Home, type LucideIcon, Settings, Users } from "lucide-react";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import useAuth from "@/hooks/useAuth";
import type { UserPublic } from "@/lib/types";

const items = [
	{ icon: Home, title: "Dashboard", path: "/" },
	{ icon: Settings, title: "User Settings", path: "/settings" },
];

interface Item {
	icon: LucideIcon;
	title: string;
	path: string;
}

const SidebarItems = () => {
	const queryClient = useQueryClient();
	const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
	const { user } = useAuth();
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
