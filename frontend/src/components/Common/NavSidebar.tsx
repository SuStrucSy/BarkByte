import { ArrowUpCircleIcon } from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "./NavUser";
import SidebarItems from "./SidebarItems";
import { useIsLoggedIn } from '@/hooks/useIsLoggedIn';

const AppSidebar = () => {
  const isLoggedIn = useIsLoggedIn()
	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:!p-1.5"
						>
							<a href="/">
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
				{isLoggedIn ? <NavUser /> : null}
			</SidebarFooter>
		</Sidebar>
	);
};

export default AppSidebar;
