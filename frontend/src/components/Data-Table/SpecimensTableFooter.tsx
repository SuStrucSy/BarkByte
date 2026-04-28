import type { PaginationState, Table } from "@tanstack/react-table";
import { DataTablePagination } from "@/components/Data-Table/DataTablePagination";
import { Skeleton } from "@/components/ui/skeleton";

interface SpecimensTableFooterProps<TData> {
	table: Table<TData>;
	pagination: PaginationState;
	filteredRowCount: number;
	totalRowCount: number;
	isLoading?: boolean;
}

function SpecimensTableFooterSkeleton() {
	return (
		<div className="hidden shrink-0 md:col-start-1 md:row-start-3 md:flex md:items-center md:justify-between md:gap-4">
			<Skeleton className="h-5 w-28" />
			<div className="flex items-center gap-3">
				<Skeleton className="h-8 w-24" />
				<Skeleton className="h-8 w-40" />
			</div>
		</div>
	);
}

export function SpecimensTableFooter<TData>({
	table,
	pagination,
	filteredRowCount,
	totalRowCount,
	isLoading = false,
}: SpecimensTableFooterProps<TData>) {
	if (isLoading) {
		return <SpecimensTableFooterSkeleton />;
	}

	return (
		<div className="hidden shrink-0 md:col-start-1 md:row-start-3 md:flex md:items-center md:justify-between md:gap-4">
			<p className="text-sm text-muted-foreground">
				<span className="font-mono font-medium">{filteredRowCount}</span> of{" "}
				<span className="font-mono font-medium">{totalRowCount}</span> row(s)
			</p>
			<DataTablePagination table={table} pagination={pagination} />
		</div>
	);
}
