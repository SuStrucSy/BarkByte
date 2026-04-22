import type { Column } from "@tanstack/react-table";
import { ChevronDown, ChevronUp } from "lucide-react";

import { OverflowTooltipText } from "@/components/Data-Table/OverflowTooltipText";
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
		return (
			<div className={cn("flex min-h-9 items-center", className)}>{title}</div>
		);
	}

	const sorted = column.getIsSorted();
	const iconClassName = cn(
		"h-3.5 w-3.5 text-muted-foreground transition-colors",
		sorted && "text-foreground",
	);

	const handleSortClick = () => {
		if (sorted === false) {
			column.toggleSorting(false);
			return;
		}
		if (sorted === "asc") {
			column.toggleSorting(true);
			return;
		}
		column.clearSorting();
	};

	return (
		<Button
			variant="ghost"
			type="button"
			onClick={handleSortClick}
			aria-label={`Sort ${title}`}
			className={cn(
				"-ml-2 inline-flex min-h-9 w-fit max-w-full items-center justify-start gap-2 px-2 text-left",
				className,
			)}
			{...props}
		>
			<OverflowTooltipText
				value={title}
				as="span"
				className="flex-1 text-sm font-medium text-foreground/80"
			/>
			{sorted === "desc" ? (
				<ChevronUp className={cn(iconClassName, "shrink-0")} />
			) : sorted === "asc" ? (
				<ChevronDown className={cn(iconClassName, "shrink-0")} />
			) : null}
		</Button>
	);
}
