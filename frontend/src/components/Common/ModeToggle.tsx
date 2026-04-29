import { ChevronsUpDown, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme";
import { modes } from "@/lib/constants";
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "../ui/sidebar";

const ModeToggle = () => {
	const { mode: currentMode, setMode } = useTheme();
	const { isMobile, state } = useSidebar();
	const isCollapsed = state === "collapsed" && !isMobile;

	const side = isCollapsed ? "right" : "top";
	return (
		<SidebarGroup className={isCollapsed ? "items-center px-0" : undefined}>
			<SidebarMenu className={isCollapsed ? "items-center" : undefined}>
				<SidebarMenuItem
					className={isCollapsed ? "flex justify-center" : undefined}
				>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							{isCollapsed ? (
								<Button
									variant="ghost"
									size="icon"
									className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground size-8 rounded-md"
								>
									<span className="relative flex size-4 items-center justify-center">
										<Sun className="absolute h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
										<Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
									</span>
									<span className="sr-only">Toggle mode</span>
								</Button>
							) : (
								<SidebarMenuButton
									size="lg"
									className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
								>
									<span className="relative flex size-4 items-center justify-center">
										<Sun className="absolute h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
										<Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
									</span>
									<span className="sr-only">Toggle mode</span>

									<span className="truncate text-xs">
										{currentMode.toUpperCase()}
									</span>

									<ChevronsUpDown className="ml-auto size-4" />
								</SidebarMenuButton>
							)}
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className={
								isCollapsed
									? "min-w-40 rounded-lg"
									: "w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
							}
							side={side}
							align="end"
							sideOffset={4}
						>
							{modes.map((mode) => (
								<DropdownMenuItem key={mode} onClick={() => setMode(mode)}>
									{mode.charAt(0).toUpperCase() + mode.slice(1)}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarGroup>
	);
};

export default ModeToggle;
