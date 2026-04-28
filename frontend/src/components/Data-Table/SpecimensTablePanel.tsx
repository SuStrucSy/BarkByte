import type {
	PaginationState,
	Table as ReactTable,
	Row,
} from "@tanstack/react-table";
import { ChevronRightIcon } from "lucide-react";
import type { SpecimenPublic } from "@/api/model";
import { ScrollableListCard } from "@/components/Common/ScrollableListCard";
import { DataTablePagination } from "@/components/Data-Table/DataTablePagination";
import { SpecimensResultsTable } from "@/components/Data-Table/SpecimensResultsTable";
import SkeletonSpecimensList from "@/components/Skeleton/SkeletonSpecimensList";
import SkeletonSpecimensTable from "@/components/Skeleton/SkeletonSpecimensTable";
import { Badge } from "@/components/ui/badge";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@/components/ui/item";

interface MobileSpecimenListItemProps {
	row: SpecimenPublic;
	onSelect: () => void;
}

function MobileSpecimenListItem({
	row,
	onSelect,
}: MobileSpecimenListItemProps) {
	const failureModes = row.e_qualitative_failure_measure
		.map((mode) => mode.label)
		.filter(Boolean);

	return (
		<Item
			variant="outline"
			asChild
			className="group/item w-full min-w-0 overflow-hidden rounded-xl border-border/70"
		>
			<button
				type="button"
				onClick={onSelect}
				className="w-full min-w-0 text-left"
			>
				<ItemContent className="min-w-0 overflow-hidden">
					<div className="flex min-w-0 items-start justify-between gap-3">
						<ItemTitle className="min-w-0 flex-1 text-base leading-snug group-hover/item:text-primary">
							<span className="block min-w-0 truncate">
								{row.specimen_reference_id}
							</span>
						</ItemTitle>
						<Badge variant="secondary" className="max-w-[45%] shrink text-xs">
							<span className="truncate">{row.joinery_type.label}</span>
						</Badge>
					</div>
					<ItemDescription className="min-w-0 truncate text-sm">
						{row.sub_joinery_type.label}
					</ItemDescription>
					<ItemDescription className="min-w-0 line-clamp-2 text-sm">
						{row.doi.ref_title || "No reference title"}
					</ItemDescription>
					<div className="flex min-w-0 flex-wrap items-center gap-2 pt-1">
						{failureModes.slice(0, 2).map((failureMode) => (
							<Badge
								key={failureMode}
								variant="outline"
								className="max-w-full shrink text-xs"
							>
								<span className="truncate">{failureMode}</span>
							</Badge>
						))}
						<Badge variant="secondary" className="max-w-full shrink text-xs">
							<span className="truncate">{row.practice}</span>
						</Badge>
					</div>
				</ItemContent>
				<ItemActions className="shrink-0 text-muted-foreground transition-colors group-hover/item:text-primary">
					<ChevronRightIcon className="size-4" />
				</ItemActions>
			</button>
		</Item>
	);
}

interface SpecimensTablePanelProps {
	table: ReactTable<SpecimenPublic>;
	pagination: PaginationState;
	columnCount: number;
	isLoading: boolean;
	onRowClick: (row: Row<SpecimenPublic>) => void;
}

export function SpecimensTablePanel({
	table,
	pagination,
	columnCount,
	isLoading,
	onRowClick,
}: SpecimensTablePanelProps) {
	const paginatedRows = table.getRowModel().rows;

	return (
		<>
			<div className="flex min-h-0 flex-1 flex-col overflow-hidden md:hidden">
				{isLoading ? (
					<SkeletonSpecimensList />
				) : (
					<ScrollableListCard
						itemGroupClassName="min-h-0 flex-1"
						scrollAreaClassName="h-full"
					>
						{paginatedRows.map((row) => (
							<MobileSpecimenListItem
								key={row.original.id}
								row={row.original}
								onSelect={() => onRowClick(row)}
							/>
						))}
						<div className="pt-2">
							<DataTablePagination table={table} pagination={pagination} />
						</div>
					</ScrollableListCard>
				)}
			</div>

			<div className="hidden min-h-0 flex-1 md:col-start-1 md:row-start-2 md:flex md:flex-col">
				{isLoading ? (
					<SkeletonSpecimensTable />
				) : (
					<SpecimensResultsTable
						table={table}
						columnCount={columnCount}
						onRowClick={onRowClick}
					/>
				)}
			</div>
		</>
	);
}
