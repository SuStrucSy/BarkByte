import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterControlsToggleProps {
	className?: string;
	controlsOpen: boolean;
	hasActiveSidebarFilters: boolean;
	onToggleControls: () => void;
}

export function FilterControlsToggle({
	className,
	controlsOpen,
	hasActiveSidebarFilters,
	onToggleControls,
}: FilterControlsToggleProps) {
	return (
		<Button
			size="sm"
			variant="ghost"
			className={cn(
				"ml-auto h-8 shrink-0 transition-colors duration-200",
				hasActiveSidebarFilters
					? "bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60 dark:hover:text-green-200"
					: "bg-transparent text-muted-foreground hover:text-foreground",
				className,
			)}
			onClick={onToggleControls}
		>
			<span
				aria-hidden="true"
				className={cn(
					"inline-flex items-center justify-center overflow-hidden transition-all duration-200",
					hasActiveSidebarFilters
						? "mr-1.5 w-3 opacity-100"
						: "mr-0 w-0 opacity-0",
				)}
			>
				<span className="text-green-600 dark:text-green-400">●</span>
			</span>
			{controlsOpen ? (
				<>
					<PanelRightClose className="h-4 w-4" />
					<span className="hidden md:block">Hide Controls</span>
				</>
			) : (
				<>
					<PanelRightOpen className="h-4 w-4" />
					<span className="hidden md:block">Show Controls</span>
				</>
			)}
		</Button>
	);
}
