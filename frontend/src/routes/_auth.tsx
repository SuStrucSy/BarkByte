import {
	createFileRoute,
	Outlet,
	Link as RouterLink,
} from "@tanstack/react-router";
import { TreePine } from "lucide-react";
import timberBuilding from "@/assets/timber-building.jpg";

export const Route = createFileRoute("/_auth")({
	component: AuthLayout,
});

function AuthLayout() {
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<RouterLink
						to="/"
						className="flex items-center gap-2 font-medium transition-transform duration-150 hover:scale-[1.02] hover:text-green-800 dark:hover:text-green-300"
					>
						<div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground transition-transform ">
							<TreePine size={17} strokeWidth={2.2} />
						</div>
						Timverse
					</RouterLink>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-sm">
						<Outlet />
					</div>
				</div>
			</div>
			<div className="relative hidden bg-muted lg:block">
				<img
					src={timberBuilding}
					alt="Mass timber building interior"
					className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
				/>
			</div>
		</div>
	);
}
