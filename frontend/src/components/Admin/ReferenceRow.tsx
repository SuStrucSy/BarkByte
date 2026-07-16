import { Pencil, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export type ReferenceColumn<TItem> = {
	header: string;
	render: (item: TItem) => ReactNode;
	className?: string;
};

type ReferenceRowProps<TItem extends { id?: string; label: string }> = {
	item: TItem;
	columns: ReferenceColumn<TItem>[];
	getItemId: (item: TItem) => string;
	gridTemplateColumns: string;
	isDeleteBlocked?: (item: TItem) => boolean;
	onEdit: (item: TItem) => void;
	onDelete: (item: TItem) => void;
};

export function ReferenceRow<TItem extends { id?: string; label: string }>({
	item,
	columns,
	getItemId,
	gridTemplateColumns,
	isDeleteBlocked,
	onEdit,
	onDelete,
}: ReferenceRowProps<TItem>) {
	return (
		<div
			className="space-y-3 rounded-lg border bg-muted/20 p-4 md:grid md:items-center md:gap-4 md:space-y-0 md:rounded-none md:border-x-0 md:border-t-0 md:bg-transparent md:px-0 md:py-3"
			style={{ gridTemplateColumns }}
		>
			{columns.map((column) => (
				<div
					key={`${getItemId(item)}-${column.header}`}
					className={`min-w-0 space-y-1 ${column.className ?? ""}`}
				>
					<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase md:hidden">
						{column.header}
					</p>
					<div>{column.render(item)}</div>
				</div>
			))}
			<div className="flex gap-2 md:justify-end">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="flex-1 justify-center md:flex-none"
					onClick={() => onEdit(item)}
				>
					<Pencil className="size-4" />
					Edit
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="flex-1 justify-center text-destructive hover:text-destructive disabled:pointer-events-auto disabled:opacity-50 md:flex-none"
					aria-disabled={isDeleteBlocked?.(item) ?? false}
					onClick={() => onDelete(item)}
				>
					<Trash2 className="size-4" />
					Delete
				</Button>
			</div>
		</div>
	);
}
