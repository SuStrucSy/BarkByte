import { ArrowUpCircleIcon, LogIn } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "./NavUser";
import SidebarItems from "./SidebarItems";
import { useIsLoggedIn } from "@/hooks/useIsLoggedIn";
import ModeToggle from "./ModeToggle";
import { Link } from "@tanstack/react-router";

const LoginButton = () => {
  return (
    <SidebarMenuButton
      asChild
      className="data-[slot=sidebar-menu-button]:p-1.5!"
    >
      <Link to="/login">
        <LogIn className="h-5 w-5" />
        <span className="text-base font-semibold">Login</span>
      </Link>
    </SidebarMenuButton>
  );
};

const AppSidebar = () => {
  const isLoggedIn = useIsLoggedIn();
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link to="/">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Timverse</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarItems />
      </SidebarContent>
      <SidebarFooter>
        <ModeToggle />
        {isLoggedIn ? <NavUser /> : <LoginButton />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
