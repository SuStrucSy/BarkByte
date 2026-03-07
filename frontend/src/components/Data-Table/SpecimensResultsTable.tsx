import type { SpecimenPublic } from "@/api/model";
import {
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { flexRender, type Row, type Table as ReactTable } from "@tanstack/react-table";

interface SpecimensResultsTableProps {
  table: ReactTable<SpecimenPublic>;
  columnCount: number;
  onRowClick: (row: Row<SpecimenPublic>) => void;
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
  return (
    <div className="min-h-0 flex-1 overflow-auto rounded-md border">
      <table className="w-full caption-bottom border-separate border-spacing-0 text-sm">
        {/* Frozen header row: column names stay visible while the table content scrolls. */}
        <thead className="[&_tr]:border-b">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="sticky top-0 z-20 border-b bg-background"
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
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {/* Render paginated/visible rows from TanStack table state. */}
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer hover:bg-muted/40"
                onClick={() => onRowClick(row)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {(() => {
                      // Special-case column formatting: some raw values need custom display tweaks.
                      const meta = cell.column.columnDef.meta;

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
                        return Array.isArray(value) ? value.join(", ") : value;
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
                      if (meta?.renderAs === "uploader_name") {
                        return (
                          (cell.row.original as any).uploader_name ||
                          cell.getValue() ||
                          "Unknown"
                        );
                      }

                      // Default rendering path for all normal columns without special formatting rules.
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
            // Empty-state row shown when no results match current filters/search.
            <TableRow>
              <TableCell colSpan={columnCount} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </tbody>
      </table>
    </div>
  );
}
