import {
	type ReferenceColumn,
	ReferenceRow,
} from "@/components/Admin/ReferenceRow";

export type { ReferenceColumn };

type ReferenceRowsProps<TItem extends { id?: string; label: string }> = {
	items: TItem[];
	columns: ReferenceColumn<TItem>[];
	getItemId: (item: TItem) => string;
	isDeleteBlocked?: (item: TItem) => boolean;
	onEdit: (item: TItem) => void;
	onDelete: (item: TItem) => void;
};

export function ReferenceRows<TItem extends { id?: string; label: string }>({
	items,
	columns,
	getItemId,
	isDeleteBlocked,
	onEdit,
	onDelete,
}: ReferenceRowsProps<TItem>) {
	const gridTemplateColumns =
		columns.length > 1
			? `repeat(${columns.length}, minmax(0, 1fr)) 180px`
			: "minmax(0, 1fr) 180px";

	return (
		<div className="space-y-3 md:space-y-0">
			<div
				className="hidden border-b pb-2 text-sm font-medium text-muted-foreground md:grid md:gap-4"
				style={{ gridTemplateColumns }}
			>
				{columns.map((column) => (
					<div key={column.header} className={column.className}>
						{column.header}
					</div>
				))}
				<div className="text-right">Actions</div>
			</div>
			{items.map((item) => (
				<ReferenceRow
					key={getItemId(item)}
					item={item}
					columns={columns}
					getItemId={getItemId}
					gridTemplateColumns={gridTemplateColumns}
					isDeleteBlocked={isDeleteBlocked}
					onEdit={onEdit}
					onDelete={onDelete}
				/>
			))}
		</div>
	);
}
