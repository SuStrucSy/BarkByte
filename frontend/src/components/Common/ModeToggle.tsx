import { ChevronsUpDown, Moon, Palette, Sun } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme";
import {
	modes,
	THEME_COLORS,
	THEME_TEXT_COLORS,
	themes,
} from "@/lib/constants";
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "../ui/sidebar";

const ModeToggle = () => {
	const {
		mode: currentMode,
		setMode,
		setTheme,
		theme: currentTheme,
	} = useTheme();
	const { isMobile, state } = useSidebar();

	const side = state === "collapsed" && !isMobile ? "right" : "top";
	return (
		<SidebarGroup>
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								size="lg"
								className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
								<Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
								<span className="sr-only">Toggle mode</span>

								<span className="truncate text-xs">
									{currentMode.toUpperCase()}
								</span>

								<ChevronsUpDown className="ml-auto size-4" />
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
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
				<SidebarMenuItem>
					{/* Color Theme Switcher */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								size="lg"
								className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<Palette
									className={`h-[1.2rem] w-[1.2rem] ${THEME_TEXT_COLORS[currentTheme] ?? "text-gray-500"}`}
								/>
								<span className="sr-only">Toggle color theme</span>
								<span className="truncate text-xs">
									Theme: {currentTheme.toUpperCase()}
								</span>
								<ChevronsUpDown className="ml-auto size-4" />
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
							side={side}
							align="end"
							sideOffset={4}
						>
							<DropdownMenuLabel>Color Theme</DropdownMenuLabel>
							<DropdownMenuSeparator />
							{themes.map((theme) => (
								<DropdownMenuItem key={theme} onClick={() => setTheme(theme)}>
									<div
										className={`mr-2 h-4 w-4 rounded-full ${THEME_COLORS[theme] ?? "bg-gray-500"}`}
									/>
									{theme.charAt(0).toUpperCase() + theme.slice(1)}
									{currentTheme === theme && <span className="ml-auto">✓</span>}
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
