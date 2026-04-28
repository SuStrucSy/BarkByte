import type { PaginationState, Table } from "@tanstack/react-table";
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps<TData> {
	table: Table<TData>;
	pagination: PaginationState;
	pageSizeOptions?: number[];
}

export function DataTablePagination<TData>({
	table,
	pagination,
	pageSizeOptions = [10, 20, 30, 40, 50],
}: DataTablePaginationProps<TData>) {
	const pageCount = Math.max(table.getPageCount(), 1);

	return (
		<div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-2 sm:justify-end sm:gap-4 md:w-auto md:gap-6 lg:gap-8">
			<div className="hidden items-center gap-2 sm:flex">
				<p className="text-sm font-medium">Rows per page</p>
				<Select
					value={`${pagination.pageSize}`}
					onValueChange={(value) => {
						table.setPageSize(Number(value));
					}}
				>
					<SelectTrigger className="h-8 w-[70px]">
						<SelectValue placeholder={pagination.pageSize} />
					</SelectTrigger>
					<SelectContent side="top">
						{pageSizeOptions.map((pageSize) => (
							<SelectItem key={pageSize} value={`${pageSize}`}>
								{pageSize}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className="min-w-0 text-sm font-medium whitespace-nowrap">
				Page {pagination.pageIndex + 1} of {pageCount}
			</div>
			<div className="flex shrink-0 items-center gap-2">
				<Button
					variant="outline"
					className="hidden h-8 w-8 p-0 lg:flex"
					onClick={() => {
						table.setPageIndex(0);
					}}
					disabled={!table.getCanPreviousPage()}
				>
					<span className="sr-only">Go to first page</span>
					<ChevronsLeft className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					className="h-8 w-8 p-0"
					onClick={() => {
						table.previousPage();
					}}
					disabled={!table.getCanPreviousPage()}
				>
					<span className="sr-only">Go to previous page</span>
					<ChevronLeft className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					className="h-8 w-8 p-0"
					onClick={() => {
						table.nextPage();
					}}
					disabled={!table.getCanNextPage()}
				>
					<span className="sr-only">Go to next page</span>
					<ChevronRight className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					className="hidden h-8 w-8 p-0 lg:flex"
					onClick={() => {
						table.setPageIndex(pageCount - 1);
					}}
					disabled={!table.getCanNextPage()}
				>
					<span className="sr-only">Go to last page</span>
					<ChevronsRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
