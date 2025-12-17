import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	type PaginationState,
	type Row,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import { useState } from "react";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	initialColumnVisibility?: Record<string, boolean>;
	data: TData[];
	isPlaceholderData: boolean;
	// Optional: a row styling hook you can pass in (default provided below)
	getRowStyle?: (row: Row<TData>) => React.CSSProperties;
	rowCount: number;
	pagination: PaginationState;
	setPagination: (
		updater: PaginationState | ((state: PaginationState) => PaginationState),
	) => void;
}

export function DataTable<TData, TValue>({
	columns,
	initialColumnVisibility,
	data,
	isPlaceholderData,
	getRowStyle,
	rowCount,
	pagination,
	setPagination,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
		initialColumnVisibility ?? {},
	);
	const table = useReactTable({
		data,
		columns,
		rowCount: rowCount,
		state: {
			pagination,
			sorting,
			columnVisibility,
		},
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		onColumnVisibilityChange: setColumnVisibility,
		getSortedRowModel: getSortedRowModel(),
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		debugTable: true,
	});

	const defaultGetRowStyle = (_row: Row<TData>) =>
		// Fallback: no styling by default; consumer can override via getRowStyle prop
		({}) as React.CSSProperties;

	const rowStyle = getRowStyle ?? defaultGetRowStyle;

	return (
		<>
			<div className="w-full h-full overflow-auto rounded-md border relative">
				<Table className="border-separate border-spacing-0">
					<TableHeader className="sticky top-0 bg-primary/95 backdrop-blur">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead
											key={header.id}
											className="sticky top-0 z-20 bg-primary/95 text-white px-3 py-4 text-left text-xs font-medium border-b border-primary/20 first:z-30"
										>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
									className={isPlaceholderData ? "opacity-50" : "opacity-100"}
									style={rowStyle(row)}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{(() => {
												const meta = cell.column.columnDef.meta;

												// ✅ Generic rendering based on meta flags
												if (meta?.renderAs === "joinery_label") {
													return (
														(cell.row.original as any).joinery_type?.label ||
														"N/A"
													);
												}
												if (meta?.renderAs === "sub_joinery_label") {
													return (
														(cell.row.original as any).sub_joinery_type
															?.label || "N/A"
													);
												}

												if (meta?.renderAs === "array_join") {
													const value = cell.getValue();
													console.log({ value });
													return Array.isArray(value)
														? value.join(", ")
														: value;
												}

												if (meta?.renderAs === "array_labels") {
													const value = cell.getValue() as any[];
													return (
														value
															?.map((item) => item?.label)
															?.filter(Boolean)
															?.join(", ") || "None"
													);
												}

												return (
													flexRender(
														cell.column.columnDef.cell,
														cell.getContext(),
													) ?? ""
												);
											})()}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-end space-x-2 h-fit py-4">
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					Next
				</Button>
				<span className="flex items-center gap-1">
					<div>Page</div>
					<strong>
						{table.getState().pagination.pageIndex + 1} of{" "}
						{table.getPageCount().toLocaleString()}
					</strong>
				</span>
				<span className="flex items-center gap-1">
					| Go to page:
					<input
						type="number"
						min="1"
						max={table.getPageCount()}
						defaultValue={table.getState().pagination.pageIndex + 1}
						onChange={(e) => {
							const page = e.target.value ? Number(e.target.value) - 1 : 0;
							table.setPageIndex(page);
						}}
						className="border p-1 rounded w-16"
					/>
				</span>
				<select
					value={table.getState().pagination.pageSize}
					onChange={(e) => {
						table.setPageSize(Number(e.target.value));
					}}
				>
					{[10, 20, 30, 40, 50].map((pageSize) => (
						<option key={pageSize} value={pageSize}>
							Show {pageSize}
						</option>
					))}
				</select>
			</div>
		</>
	);
}
