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
	useSidebar,
} from "@/components/ui/sidebar";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const items = [
	{ icon: Home, title: "Home", path: "/" },
	{ icon: Users, title: "Team", path: "/team" },
	{ icon: ChartSpline, title: "Dashboard", path: "/dashboard" },
	{ icon: Newspaper, title: "References", path: "/references" },
	{ icon: Columns3, title: "Compare", path: "/compare" },
];

const groupTwoItems = [{ icon: Layers, title: "All Specimens", path: "/specimens" }];

interface Item {
	icon: LucideIcon;
	title: string;
	path: string;
}

const SidebarItems = () => {
	const { data: currentUser } = useCurrentUser();
	const { pathname } = useLocation();
	const { isMobile, setOpenMobile } = useSidebar();

	const handleNavigation = () => {
		if (isMobile) {
			setOpenMobile(false);
		}
	};

	const specimenItems: Item[] = currentUser
		? [
				{ icon: LayersPlus, title: "Add Specimen", path: "/specimens/new" },
				...groupTwoItems,
				{
					icon: ListTodo,
					title: "Pending Specimens",
					path: "/specimens/pending",
				},
			]
		: groupTwoItems;

	const listItems = items.map((item) => (
		<RouterLink key={item.title} to={item.path} onClick={handleNavigation}>
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
		<RouterLink key={item.title} to={item.path} onClick={handleNavigation}>
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
		</>
	);
};

export default SidebarItems;
