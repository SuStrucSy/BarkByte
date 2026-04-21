import {
	type Cell,
	type Column,
	flexRender,
	type Header,
	type Table as ReactTable,
	type Row,
} from "@tanstack/react-table";
import type { SpecimenPublic } from "@/api/model";
import { OverflowTooltipText } from "@/components/Data-Table/OverflowTooltipText";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface SpecimensResultsTableProps {
	table: ReactTable<SpecimenPublic>;
	columnCount: number;
	onRowClick: (row: Row<SpecimenPublic>) => void;
}

function getColumnWidthRemForColumn(column: Column<SpecimenPublic, unknown>) {
	if (column.columnDef.meta?.renderAs === "array_badges") {
		return 30;
	}

	const label =
		column.columnDef.meta?.label ??
		(typeof column.columnDef.header === "string"
			? column.columnDef.header
			: column.id);

	return Math.max(8, Math.ceil(String(label).length * 0.7 + 3));
}

function getColumnWidthRem(header: Header<SpecimenPublic, unknown>) {
	return getColumnWidthRemForColumn(header.column);
}

function getPlainTextCellValue(cell: Cell<SpecimenPublic, unknown>) {
	const meta = cell.column.columnDef.meta;
	const rawValue = cell.getValue();

	if (meta?.renderAs === "array_badges") {
		return null;
	}

	if (meta?.renderAs === "joinery_label") {
		return cell.row.original.joinery_type?.label || "N/A";
	}

	if (meta?.renderAs === "sub_joinery_label") {
		return cell.row.original.sub_joinery_type?.label || "N/A";
	}

	if (meta?.renderAs === "array_join") {
		if (Array.isArray(rawValue)) {
			return rawValue.join(", ") || "N/A";
		}
		return typeof rawValue === "string" ? rawValue || "N/A" : null;
	}

	if (meta?.renderAs === "array_labels") {
		if (Array.isArray(rawValue)) {
			return (
				rawValue
					.map((item) => (typeof item === "string" ? item : item?.label))
					.filter(Boolean)
					.join(", ") || "None"
			);
		}
		return typeof rawValue === "string" ? rawValue || "None" : null;
	}

	return typeof rawValue === "string" ? rawValue : null;
}

/**
 * Renders the specimens results grid using a prepared TanStack table instance.
 * Handles sticky headers, row click navigation, custom cell display rules,
 * and the empty-table fallback state.
 */
export function SpecimensResultsTable({
	table,
	columnCount,
	onRowClick,
}: SpecimensResultsTableProps) {
	const visibleColumnsMinWidth = table
		.getHeaderGroups()[0]
		?.headers.reduce((total, header) => total + getColumnWidthRem(header), 0);

	return (
		<ScrollArea className="min-h-0 flex-1 overflow-hidden rounded-md border border-border/60 bg-background">
			<table
				className="w-full table-fixed caption-bottom text-sm"
				style={{
					minWidth: `${visibleColumnsMinWidth ?? table.getVisibleLeafColumns().length * 10}rem`,
				}}
			>
				{/* Frozen header row: column names stay visible while the table content scrolls. */}
				<TableHeader className="sticky top-0 z-10 bg-background">
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow
							key={headerGroup.id}
							className="border-border/60 hover:bg-transparent"
						>
							{headerGroup.headers.map((header) => (
								<TableHead
									key={header.id}
									className="h-12 bg-background px-4 text-sm font-medium text-foreground/80"
									style={{ width: `${getColumnWidthRem(header)}rem` }}
								>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{/* Render paginated/visible rows from TanStack table state. */}
					{table.getRowModel().rows.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								className="border-border/50 cursor-pointer data-[state=selected]:bg-muted/50"
								onClick={() => onRowClick(row)}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell
										key={cell.id}
										className="min-w-0 overflow-hidden px-4 py-3 align-middle text-sm"
										style={{
											width: `${getColumnWidthRemForColumn(cell.column)}rem`,
										}}
									>
										{(() => {
											const plainTextValue = getPlainTextCellValue(cell);

											if (plainTextValue !== null) {
												return <OverflowTooltipText value={plainTextValue} />;
											}

											const rendered =
												flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												) ?? "";

											return (
												<div className="min-w-0 max-w-full overflow-hidden">
													{rendered}
												</div>
											);
										})()}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						// Empty-state row shown when no results match current filters/search.
						<TableRow>
							<TableCell
								colSpan={columnCount}
								className="h-24 px-4 text-center text-sm text-muted-foreground"
							>
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</table>
		</ScrollArea>
	);
}
