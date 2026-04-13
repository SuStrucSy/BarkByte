import { Link } from "@tanstack/react-router";
import { LogIn, TreePine } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsLoggedIn } from "@/hooks/useIsLoggedIn";
import ModeToggle from "./ModeToggle";
import { NavUser } from "./NavUser";
import SidebarItems from "./SidebarItems";

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
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <div className="relative min-h-8">
          <div
            className={[
              "transition-all duration-200 ease-linear",
              state === "expanded"
                ? "translate-y-0 opacity-100"
                : "pointer-events-none absolute inset-0 -translate-y-1 opacity-0",
            ].join(" ")}
          >
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="data-[slot=sidebar-menu-button]:p-1.5!"
                >
                  <Link to="/">
                    <TreePine />
                    <span className="text-base font-semibold">Timverse</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
          <div
            className={[
              "flex justify-center transition-all duration-200 ease-linear",
              state === "collapsed"
                ? "scale-100 opacity-100"
                : "pointer-events-none absolute inset-0 scale-95 opacity-0",
            ].join(" ")}
          >
            <SidebarTrigger className="size-8 rounded-md border border-sidebar-border/70" />
          </div>
        </div>
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
