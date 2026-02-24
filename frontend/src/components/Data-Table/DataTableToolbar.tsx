import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Table } from "@tanstack/react-table";
import {
  Check,
  PanelRightClose,
  PanelRightOpen,
  RotateCcw,
  Settings2,
} from "lucide-react";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  totalRows: number;
  filteredRows: number;
  controlsOpen: boolean;
  onToggleControls: () => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export function DataTableToolbar<TData>({
  table,
  totalRows,
  filteredRows,
  controlsOpen,
  onToggleControls,
  hasActiveFilters,
  onResetFilters,
}: DataTableToolbarProps<TData>) {
  const visibleColumns = table
    .getAllColumns()
    .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide());

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Settings2 className="h-4 w-4" />
              <span className="sr-only">View options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72">
            <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-72 overflow-y-auto">
              {visibleColumns.map((column) => (
                <DropdownMenuItem
                  key={column.id}
                  onSelect={(event) => {
                    event.preventDefault();
                    column.toggleVisibility(!column.getIsVisible());
                  }}
                  className="capitalize"
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
                  {column.id.replaceAll("_", " ")}
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <p className="text-sm text-muted-foreground">
          <span className="font-mono font-medium">{filteredRows}</span> of{" "}
          <span className="font-mono font-medium">{totalRows}</span> row(s)
        </p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={onToggleControls}>
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

        {hasActiveFilters ? (
          <Button variant="outline" size="sm" onClick={onResetFilters}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        ) : null}
      </div>
    </div>
  );
}
