import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import Navbar from "@/components/Common/Navbar";
import AppSidebar from "@/components/Common/NavSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const Route = createFileRoute("/_layout")({
	component: Layout,
	// beforeLoad: async () => {
	// 	const token =
	// 		typeof window !== "undefined"
	// 			? localStorage.getItem("access_token")
	// 			: null;
	// 	if (!token) {
	// 		throw redirect({ to: "/login" });
	// 	}
	// },
});

function Layout() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<Navbar />
				<div className="flex flex-col flex-1 p-10 overflow-y-auto">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}

export default Layout;
