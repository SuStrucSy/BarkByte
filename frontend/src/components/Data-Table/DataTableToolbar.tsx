import type { Table } from "@tanstack/react-table";
import type { SpecimenPublic } from "@/api/model";
import { ColumnVisibilityMenu } from "@/components/Data-Table/ColumnVisibilityMenu";
import { DownloadCsvButton } from "@/components/Data-Table/DownloadCsvButton";
import { FilterControlsToggle } from "@/components/Data-Table/FilterControlsToggle";
import SpecimenSearch from "@/components/Specimens/SpecimenSearch";
import { cn } from "@/lib/utils";

interface DataTableToolbarProps<TData> {
	className?: string;
	viewOptionsClassName?: string;
	controlsToggleClassName?: string;
	table: Table<TData>;
	totalRows: number;
	filteredRows: number;
	controlsOpen: boolean;
	hasActiveSidebarFilters?: boolean;
	onToggleControls: () => void;
	onResetColumns?: () => void;
	specimens?: SpecimenPublic[];
	onSelectSpecimen?: (specimen: SpecimenPublic) => void;
	onDownloadCsv?: () => void;
	showViewOptions?: boolean;
	showControlsToggle?: boolean;
}

export function DataTableToolbar<TData>({
	className,
	viewOptionsClassName,
	controlsToggleClassName,
	table,
	totalRows,
	filteredRows,
	controlsOpen,
	hasActiveSidebarFilters = false,
	onToggleControls,
	onResetColumns,
	specimens,
	onSelectSpecimen,
	onDownloadCsv,
	showViewOptions = true,
	showControlsToggle = true,
}: DataTableToolbarProps<TData>) {
	return (
		<div
			className={cn(
				"flex min-h-10 w-full flex-wrap items-center gap-3",
				className,
			)}
		>
			<div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 px-4 py-2">
				{showViewOptions ? (
					<ColumnVisibilityMenu
						table={table}
						className={viewOptionsClassName}
						onResetColumns={onResetColumns}
					/>
				) : null}

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
					<DownloadCsvButton
						totalRows={totalRows}
						filteredRows={filteredRows}
						onDownloadCsv={onDownloadCsv}
					/>
				) : null}
			</div>

			{showControlsToggle ? (
				<FilterControlsToggle
					className={controlsToggleClassName}
					controlsOpen={controlsOpen}
					hasActiveSidebarFilters={hasActiveSidebarFilters}
					onToggleControls={onToggleControls}
				/>
			) : null}
		</div>
	);
}
