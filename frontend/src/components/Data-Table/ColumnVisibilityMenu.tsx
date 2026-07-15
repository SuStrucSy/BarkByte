import type { Table } from "@tanstack/react-table";
import { RotateCcw, Settings2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

interface ColumnVisibilityMenuProps<TData> {
	className?: string;
	table: Table<TData>;
	onResetColumns?: () => void;
}

export function ColumnVisibilityMenu<TData>({
	className,
	table,
	onResetColumns,
}: ColumnVisibilityMenuProps<TData>) {
	const [resetRotation, setResetRotation] = useState(0);
	const visibleColumns = table
		.getAllColumns()
		.filter(
			(column) =>
				typeof column.accessorFn !== "undefined" && column.getCanHide(),
		);
	const allColumnsVisible =
		visibleColumns.length > 0 &&
		visibleColumns.every((column) => column.getIsVisible());

	const setAllColumnsVisible = (isVisible: boolean) => {
		for (const column of visibleColumns) {
			column.toggleVisibility(isVisible);
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					className={cn("h-8 w-8", className)}
				>
					<Settings2 className="h-4 w-4" />
					<span className="sr-only">View options</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-72 overflow-hidden p-3">
				<DropdownMenuLabel className="flex items-center gap-2">
					<Checkbox
						checked={allColumnsVisible}
						onCheckedChange={() => setAllColumnsVisible(!allColumnsVisible)}
					/>
					<span className="flex-1">Toggle Columns</span>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="h-7 w-7 shrink-0"
						onClick={(event) => {
							event.stopPropagation();
							setResetRotation((current) => current - 360);
							onResetColumns?.();
						}}
					>
						<RotateCcw
							className="h-3.5 w-3.5 transition-transform duration-300 ease-out"
							style={{ transform: `rotate(${resetRotation}deg)` }}
						/>
						<span className="sr-only">Reset columns</span>
					</Button>
				</DropdownMenuLabel>
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
							<Checkbox
								checked={column.getIsVisible()}
								className="pointer-events-none mr-2"
								aria-hidden="true"
							/>
							{column.columnDef.meta?.label ?? column.id.replaceAll("_", " ")}
						</DropdownMenuItem>
					))}
				</ScrollArea>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
