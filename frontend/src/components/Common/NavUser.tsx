"use client";

import { Link } from "@tanstack/react-router";
import { ChevronsUpDown, LogOut, Settings, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import useAuth from "@/hooks/useAuth";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getInitials } from "@/lib/utils";

export function NavUser() {
	const { data: currentUser } = useCurrentUser();
	const { isMobile, setOpenMobile, state } = useSidebar();
	const { logout } = useAuth();

	const side = state === "collapsed" && !isMobile ? "right" : "top";
	const handleNavigation = () => {
		if (isMobile) {
			setOpenMobile(false);
		}
	};

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage alt={currentUser?.full_name || ""} />
								<AvatarFallback className="rounded-lg">
									{getInitials(currentUser?.full_name || "")}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">
									{currentUser?.full_name}
								</span>
								<span className="truncate text-xs">{currentUser?.email}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						side={side}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage alt={currentUser?.full_name || ""} />
									<AvatarFallback className="rounded-lg">
										{getInitials(currentUser?.full_name || "")}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">
										{currentUser?.full_name}
									</span>
									<span className="truncate text-xs">{currentUser?.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem asChild>
								<Link to="/settings" onClick={handleNavigation}>
									<Settings />
									Account Settings
								</Link>
							</DropdownMenuItem>
							{currentUser?.is_superuser ? (
								<DropdownMenuItem asChild>
									<Link to="/admin" onClick={handleNavigation}>
										<Shield />
										Admin Settings
									</Link>
								</DropdownMenuItem>
							) : null}
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => {
								logout();
							}}
						>
							<LogOut />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
