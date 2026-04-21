import type { Table } from "@tanstack/react-table";
import {
	Check,
	PanelRightClose,
	PanelRightOpen,
	Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface DataTableToolbarProps<TData> {
	table: Table<TData>;
	totalRows: number;
	filteredRows: number;
	controlsOpen: boolean;
	onToggleControls: () => void;
}

export function DataTableToolbar<TData>({
	table,
	totalRows,
	filteredRows,
	controlsOpen,
	onToggleControls,
}: DataTableToolbarProps<TData>) {
	const visibleColumns = table
		.getAllColumns()
		.filter(
			(column) =>
				typeof column.accessorFn !== "undefined" && column.getCanHide(),
		);

	return (
		<div className="flex min-h-10 flex-wrap items-center justify-between gap-3 px-1">
			<div className="flex items-center gap-3">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="icon" className="h-8 w-8">
							<Settings2 className="h-4 w-4" />
							<span className="sr-only">View options</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="start"
						className="w-72 overflow-hidden p-0"
					>
						<DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<ScrollArea className="h-72">
							{visibleColumns.map((column) => (
								<DropdownMenuItem
									key={column.id}
									onSelect={(event) => {
										event.preventDefault();
										column.toggleVisibility(!column.getIsVisible());
									}}
								>
									<div
										className={cn(
											"mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
											column.getIsVisible()
												? "bg-primary text-primary-foreground"
												: "opacity-50 [&_svg]:invisible",
										)}
									>
										<Check className="h-4 w-4" />
									</div>
									{column.columnDef.meta?.label ??
										column.id.replaceAll("_", " ")}
								</DropdownMenuItem>
							))}
						</ScrollArea>
					</DropdownMenuContent>
				</DropdownMenu>

				<p className="text-sm text-muted-foreground">
					<span className="font-mono font-medium">{filteredRows}</span> of{" "}
					<span className="font-mono font-medium">{totalRows}</span> row(s)
				</p>
			</div>

			<div className="ml-auto flex items-center gap-2">
				<Button
					size="sm"
					variant="ghost"
					className="h-8 text-muted-foreground hover:text-foreground"
					onClick={onToggleControls}
				>
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
			</div>
		</div>
	);
}
