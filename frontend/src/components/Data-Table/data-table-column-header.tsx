import type { Column } from "@tanstack/react-table";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";

import { cn } from "@/lib/utils";

interface DataTableColumnHeaderProps<TData, TValue> extends ButtonProps {
	column: Column<TData, TValue>;
	title: string;
}

export function DataTableColumnHeader<TData, TValue>({
	column,
	title,
	className,
	...props
}: DataTableColumnHeaderProps<TData, TValue>) {
	if (!column.getCanSort()) {
		return <div className={cn(className)}>{title}</div>;
	}

	const sorted = column.getIsSorted();

	return (
		<div
			className={cn(
				"flex h-7 w-full items-center justify-between gap-2",
				className,
			)}
		>
			<span>{title}</span>
			<span className="flex flex-col">
				<Button
					variant="ghost"
					size="icon"
					type="button"
					aria-label={`Sort ${title} descending`}
					onClick={() => {
						if (sorted === "desc") {
							column.clearSorting();
							return;
						}
						column.toggleSorting(true);
					}}
					className="h-3 w-3 p-0 hover:bg-transparent"
					{...props}
				>
					<ChevronUp
						className={cn(
							"h-3 w-3",
							sorted === "desc"
								? "text-accent-foreground"
								: "text-muted-foreground",
						)}
					/>
				</Button>
				<Button
					variant="ghost"
					size="icon"
					type="button"
					aria-label={`Sort ${title} ascending`}
					onClick={() => {
						if (sorted === "asc") {
							column.clearSorting();
							return;
						}
						column.toggleSorting(false);
					}}
					className="h-3 w-3 p-0 hover:bg-transparent"
				>
					<ChevronDown
						className={cn(
							"h-3 w-3",
							sorted === "asc"
								? "text-accent-foreground"
								: "text-muted-foreground",
						)}
					/>
				</Button>
			</span>
		</div>
	);
}
