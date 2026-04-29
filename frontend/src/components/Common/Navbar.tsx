import { useMatches } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

interface NavbarProps {
	onShowDisclaimer: () => void;
}

function Navbar({ onShowDisclaimer }: NavbarProps) {
	const matches = useMatches();
	const { state } = useSidebar();

	// Get the deepest matched route with a title in staticData
	const lastMatchWithTitle = [...matches]
		.reverse()
		.find((match) => match.staticData?.title);

	const title = lastMatchWithTitle?.staticData.title || "";

	return (
		<header className="sticky top-0 z-50  group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2  transition-[width,height] ease-linear">
			<div className="flex w-full items-center gap-1 px-3 sm:px-4 lg:gap-2 lg:px-6">
				<div
					className={[
						"flex items-center overflow-hidden transition-all duration-200 ease-linear",
						state === "expanded"
							? "max-w-24 translate-x-0 opacity-100"
							: "pointer-events-none max-w-0 -translate-x-2 opacity-0",
					].join(" ")}
				>
					<SidebarTrigger className="-ml-1 transition-all" />
					<Separator
						orientation="vertical"
						className="mx-2 data-[orientation=vertical]:h-4"
					/>
				</div>
				<h1 className="min-w-0 truncate text-base font-medium">{title}</h1>
				<div className="ml-auto">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={onShowDisclaimer}
						className="h-8 border-0 px-2 text-sm text-muted-foreground hover:text-foreground"
					>
						Show disclaimer
					</Button>
				</div>
			</div>
		</header>
	);
}

export default Navbar;
