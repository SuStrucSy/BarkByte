import { useMatches } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

function Navbar() {
	const matches = useMatches();
	const { state } = useSidebar();

	// Get the deepest matched route with a title in staticData
	const lastMatchWithTitle = [...matches]
		.reverse()
		.find((match) => match.staticData?.title);

	const title = lastMatchWithTitle?.staticData.title || "";

	return (
		<header className="sticky top-0 z-50  group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2  transition-[width,height] ease-linear">
			<div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
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
				<h1 className="text-base font-medium">{title}</h1>
			</div>
		</header>
	);
}

export default Navbar;
