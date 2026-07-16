import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { handleError } from "@/lib/utils";
import { ReferenceCreateDialog } from "./ReferenceCreateDialog";
import { ReferenceDeleteDialog } from "./ReferenceDeleteDialog";
import { ReferenceEditDialog } from "./ReferenceEditDialog";
import { type ReferenceColumn, ReferenceRows } from "./ReferenceRows";
import { ReferenceSection } from "./ReferenceSection";

type ReferenceResourceSectionProps<
	TItem extends { id?: string; label: string },
	TFormValues extends FieldValues,
> = {
	title: string;
	items: TItem[];
	isLoading: boolean;
	getItemId: (item: TItem) => string;
	getDeleteDescription: (item: TItem) => string;
	getDeleteBlockedDescription?: (item: TItem) => string;
	isDeleteBlocked?: (item: TItem) => boolean;
	columns: ReferenceColumn<TItem>[];
	createDefaultValues: TFormValues;
	getEditDefaultValues: (item: TItem) => TFormValues;
	renderFormFields: (form: UseFormReturn<TFormValues>) => ReactNode;
	onCreate: (values: TFormValues) => Promise<unknown>;
	onUpdate: (id: string, values: TFormValues) => Promise<unknown>;
	onDelete: (id: string) => Promise<unknown>;
	onInvalidate: () => Promise<unknown>;
};

export function ReferenceResourceSection<
	TItem extends { id?: string; label: string },
	TFormValues extends FieldValues,
>({
	title,
	items,
	isLoading,
	getItemId,
	getDeleteDescription,
	getDeleteBlockedDescription,
	isDeleteBlocked,
	columns,
	createDefaultValues,
	getEditDefaultValues,
	renderFormFields,
	onCreate,
	onUpdate,
	onDelete,
	onInvalidate,
}: ReferenceResourceSectionProps<TItem, TFormValues>) {
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<TItem | null>(null);
	const [deletingItem, setDeletingItem] = useState<TItem | null>(null);
	const createForm = useForm<TFormValues>({
		defaultValues: createDefaultValues,
	});
	const editForm = useForm<TFormValues>({
		defaultValues: createDefaultValues,
	});

	useEffect(() => {
		if (!isCreateOpen) {
			createForm.reset(createDefaultValues);
		}
	}, [createDefaultValues, createForm, isCreateOpen]);

	useEffect(() => {
		if (editingItem) {
			editForm.reset(getEditDefaultValues(editingItem));
		}
	}, [editForm, editingItem, getEditDefaultValues]);

	const handleCreate = createForm.handleSubmit(async (values) => {
		try {
			await onCreate(values);
			await onInvalidate();
			toast.success(`${title} item created.`);
			createForm.reset(createDefaultValues);
			setIsCreateOpen(false);
		} catch (error) {
			handleError(error);
		}
	});

	const handleUpdate = editForm.handleSubmit(async (values) => {
		if (!editingItem) {
			return;
		}

		try {
			await onUpdate(getItemId(editingItem), values);
			await onInvalidate();
			toast.success(`${title} item updated.`);
			setEditingItem(null);
		} catch (error) {
			handleError(error);
		}
	});

	const handleDelete = async () => {
		if (!deletingItem) {
			return;
		}

		if (isDeleteBlocked?.(deletingItem)) {
			toast.error(
				getDeleteBlockedDescription?.(deletingItem) ??
					"This item is used by one or more specimens and cannot be deleted.",
			);
			return;
		}

		try {
			await onDelete(getItemId(deletingItem));
			await onInvalidate();
			toast.success(`${title} item deleted.`);
			setDeletingItem(null);
		} catch (error) {
			handleError(error);
		}
	};

	const handleDeleteClick = (item: TItem) => {
		if (isDeleteBlocked?.(item)) {
			toast.error(
				getDeleteBlockedDescription?.(item) ??
					"This item is currently being used by specimens and cannot be deleted.",
			);
			return;
		}

		setDeletingItem(item);
	};

	const deleteDescription = deletingItem
		? isDeleteBlocked?.(deletingItem)
			? (getDeleteBlockedDescription?.(deletingItem) ??
				"This item is used by one or more specimens and cannot be deleted.")
			: getDeleteDescription(deletingItem)
		: "";

	return (
		<>
			<ReferenceSection
				title={title}
				isLoading={isLoading}
				isEmpty={items.length === 0}
				onAdd={() => setIsCreateOpen(true)}
			>
				<ReferenceRows
					items={items}
					columns={columns}
					getItemId={getItemId}
					isDeleteBlocked={isDeleteBlocked}
					onEdit={setEditingItem}
					onDelete={handleDeleteClick}
				/>
			</ReferenceSection>

			<ReferenceCreateDialog
				title={title}
				open={isCreateOpen}
				onOpenChange={setIsCreateOpen}
				form={createForm}
				onSubmit={handleCreate}
				renderFormFields={renderFormFields}
			/>

			<ReferenceEditDialog
				title={title}
				open={Boolean(editingItem)}
				onOpenChange={(open) => !open && setEditingItem(null)}
				form={editForm}
				onSubmit={handleUpdate}
				renderFormFields={renderFormFields}
			/>

			<ReferenceDeleteDialog
				title={title}
				open={Boolean(deletingItem)}
				onOpenChange={(open) => !open && setDeletingItem(null)}
				description={deleteDescription}
				isDeleteDisabled={
					deletingItem ? (isDeleteBlocked?.(deletingItem) ?? false) : false
				}
				onConfirm={handleDelete}
			/>
		</>
	);
}
