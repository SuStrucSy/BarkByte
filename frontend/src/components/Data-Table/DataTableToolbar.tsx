import type { Table } from "@tanstack/react-table";
import {
	DownloadIcon,
	PanelRightClose,
	PanelRightOpen,
	RotateCcw,
	Settings2,
} from "lucide-react";
import { useState } from "react";
import type { SpecimenPublic } from "@/api/model";
import SpecimenSearch from "@/components/Specimens/SpecimenSearch";
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

interface DataTableToolbarProps<TData> {
	className?: string;
	table: Table<TData>;
	totalRows: number;
	filteredRows: number;
	controlsOpen: boolean;
	onToggleControls: () => void;
	onResetColumns?: () => void;
	specimens?: SpecimenPublic[];
	onSelectSpecimen?: (specimen: SpecimenPublic) => void;
	onDownloadCsv?: () => void;
}

export function DataTableToolbar<TData>({
	className,
	table,
	totalRows,
	filteredRows,
	controlsOpen,
	onToggleControls,
	onResetColumns,
	specimens,
	onSelectSpecimen,
	onDownloadCsv,
}: DataTableToolbarProps<TData>) {
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
		<div
			className={cn(
				"flex min-h-10 w-full flex-wrap items-center gap-3 px-1",
				className,
			)}
		>
			<div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="icon" className="h-8 w-8">
							<Settings2 className="h-4 w-4" />
							<span className="sr-only">View options</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="start"
						className="w-72 overflow-hidden p-3"
					>
						<DropdownMenuLabel className="flex items-center gap-2">
							<Checkbox
								checked={allColumnsVisible}
								onCheckedChange={() =>
									setAllColumnsVisible(!allColumnsVisible)
								}
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
									{column.columnDef.meta?.label ??
										column.id.replaceAll("_", " ")}
								</DropdownMenuItem>
							))}
						</ScrollArea>
					</DropdownMenuContent>
				</DropdownMenu>
				
				{specimens ? (
					<SpecimenSearch
						specimens={specimens}
						onSelect={onSelectSpecimen}
						buttonClassName="px-2 xl:px-3"
						labelClassName="hidden xl:inline"
						shortcutClassName="hidden 2xl:flex"
					/>
				) : null}

				{onDownloadCsv ? (
					<Button
						variant="outline"
						size="sm"
						className="px-2 xl:px-3"
						disabled={!filteredRows}
						onClick={onDownloadCsv}
					>
						<DownloadIcon className="size-4 xl:mr-2" />
						<span className="sr-only">Download CSV</span>
						<span className="hidden xl:inline">Download</span>
						{filteredRows !== totalRows ? (
							<span className="hidden text-muted-foreground xl:ml-1 xl:inline">
								({filteredRows})
							</span>
						) : null}
					</Button>
				) : null}

				
			</div>

			<Button
				size="sm"
				variant="ghost"
				className="ml-auto h-8 shrink-0 text-muted-foreground hover:text-foreground"
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
	);
}
