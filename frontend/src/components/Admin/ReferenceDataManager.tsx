import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	getFailuremodeGetModesQueryKey,
	useFailuremodeCreateMode,
	useFailuremodeDeleteMode,
	useFailuremodeGetModes,
	useFailuremodeUpdateMode,
} from "@/api/endpoints/failuremode/failuremode";
import {
	getFastenertypeGetFastenerTypesQueryKey,
	useFastenertypeCreateFastenerType,
	useFastenertypeDeleteFastenerType,
	useFastenertypeGetFastenerTypes,
	useFastenertypeUpdateFastenerType,
} from "@/api/endpoints/fastenertype/fastenertype";
import {
	getJoinerytypeGetJtypesQueryKey,
	useJoinerytypeCreateJtype,
	useJoinerytypeDeleteJtype,
	useJoinerytypeGetJtypes,
	useJoinerytypeUpdateJtype,
} from "@/api/endpoints/joinerytype/joinerytype";
import {
	getLoadingdirectionGetLoadingDirectionsQueryKey,
	useLoadingdirectionCreateLoadingDirection,
	useLoadingdirectionDeleteLoadingDirection,
	useLoadingdirectionGetLoadingDirections,
	useLoadingdirectionUpdateLoadingDirection,
} from "@/api/endpoints/loadingdirection/loadingdirection";
import { useSpecimensReadSpecimens } from "@/api/endpoints/specimens/specimens";
import {
	getSubjoinerytypeGetSjtypesQueryKey,
	useSubjoinerytypeCreateSjtype,
	useSubjoinerytypeDeleteSjtype,
	useSubjoinerytypeGetSjtypes,
	useSubjoinerytypeUpdateSjtype,
} from "@/api/endpoints/subjoinerytype/subjoinerytype";
import {
	type FailureMode,
	type FailureModeCreate,
	FailureModeType,
	type FastenerType,
	type FastenerTypeCreate,
	type JoineryType,
	type JoineryTypeCreate,
	type LoadingDirection,
	type LoadingDirectionCreate,
	type SubJoineryType,
	type SubJoineryTypeCreate,
} from "@/api/model";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { handleError } from "@/lib/utils";

const LARGE_LIMIT = 500;
const SPECIMEN_USAGE_LIMIT = 5000;

type ReferenceColumn<TItem> = {
	header: string;
	render: (item: TItem) => ReactNode;
	className?: string;
};

type ReferenceSectionProps<
	TItem extends { id?: string; label: string },
	TFormValues extends FieldValues,
> = {
	title: string;
	description: string;
	items: TItem[];
	isLoading: boolean;
	createLabel: string;
	getItemId: (item: TItem) => string;
	getDeleteDescription: (item: TItem) => string;
	getDeleteBlockedDescription?: (item: TItem) => string;
	isDeleteBlocked?: (item: TItem) => boolean;
	columns: ReferenceColumn<TItem>[];
	createDefaultValues: TFormValues;
	getEditDefaultValues: (item: TItem) => TFormValues;
	renderFormFields: (
		form: UseFormReturn<TFormValues>,
		mode: "create" | "edit",
	) => ReactNode;
	onCreate: (values: TFormValues) => Promise<unknown>;
	onUpdate: (id: string, values: TFormValues) => Promise<unknown>;
	onDelete: (id: string) => Promise<unknown>;
	onInvalidate: () => Promise<unknown>;
};

function ReferenceSection<
	TItem extends { id?: string; label: string },
	TFormValues extends FieldValues,
>({
	title,
	description,
	items,
	isLoading,
	createLabel,
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
}: ReferenceSectionProps<TItem, TFormValues>) {
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<TItem | null>(null);
	const [deletingItem, setDeletingItem] = useState<TItem | null>(null);
	const createForm = useForm<TFormValues>({
		defaultValues: createDefaultValues,
	});
	const editForm = useForm<TFormValues>({ defaultValues: createDefaultValues });
	const deleteForm = useForm();

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

	const handleDelete = deleteForm.handleSubmit(async () => {
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
	});

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

	return (
		<Card>
			<CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-1">
					<CardTitle>{title}</CardTitle>
					<CardDescription>{description}</CardDescription>
				</div>
				<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
					<Form {...createForm}>
						<form id={`${title}-create-form`} onSubmit={handleCreate}>
							<DialogTrigger asChild>
								<Button type="button">
									<Plus className="size-4" />
									{createLabel}
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>{createLabel}</DialogTitle>
									<DialogDescription>{description}</DialogDescription>
								</DialogHeader>
								<div className="grid gap-4 py-2">
									{renderFormFields(createForm, "create")}
								</div>
								<DialogFooter>
									<DialogClose asChild>
										<Button
											type="button"
											variant="outline"
											disabled={createForm.formState.isSubmitting}
										>
											Cancel
										</Button>
									</DialogClose>
									<Button
										type="submit"
										form={`${title}-create-form`}
										disabled={createForm.formState.isSubmitting}
									>
										Save
									</Button>
								</DialogFooter>
							</DialogContent>
						</form>
					</Form>
				</Dialog>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="md:hidden">
					{isLoading ? (
						<div className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
							Loading…
						</div>
					) : items.length === 0 ? (
						<div className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
							No items yet.
						</div>
					) : (
						<div className="space-y-3">
							{items.map((item) => (
								<div
									key={getItemId(item)}
									className="space-y-3 rounded-lg border bg-muted/20 p-4"
								>
									<div className="space-y-2">
										{columns.map((column) => (
											<div
												key={`${getItemId(item)}-${column.header}`}
												className="space-y-1"
											>
												<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
													{column.header}
												</p>
												<div className={column.className}>
													{column.render(item)}
												</div>
											</div>
										))}
									</div>
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="w-full justify-center text-destructive hover:text-destructive disabled:pointer-events-auto disabled:opacity-50"
										aria-disabled={isDeleteBlocked?.(item) ?? false}
										onClick={() => handleDeleteClick(item)}
									>
										<Trash2 className="size-4" />
										Delete
									</Button>
								</div>
							))}
						</div>
					)}
				</div>

				<div className="hidden md:block">
					<Table>
						<TableHeader>
							<TableRow>
								{columns.map((column) => (
									<TableHead key={column.header} className={column.className}>
										{column.header}
									</TableHead>
								))}
								<TableHead className="w-[140px] text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell
										colSpan={columns.length + 1}
										className="py-6 text-center text-muted-foreground"
									>
										Loading…
									</TableCell>
								</TableRow>
							) : items.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={columns.length + 1}
										className="py-6 text-center text-muted-foreground"
									>
										No items yet.
									</TableCell>
								</TableRow>
							) : (
								items.map((item) => (
									<TableRow key={getItemId(item)}>
										{columns.map((column) => (
											<TableCell
												key={`${getItemId(item)}-${column.header}`}
												className={column.className}
											>
												{column.render(item)}
											</TableCell>
										))}
										<TableCell className="text-right">
											<div className="flex justify-end gap-2">
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="text-destructive hover:text-destructive disabled:pointer-events-auto disabled:opacity-50"
													aria-disabled={isDeleteBlocked?.(item) ?? false}
													onClick={() => handleDeleteClick(item)}
												>
													<Trash2 className="size-4" />
													Delete
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</CardContent>

			<Dialog
				open={Boolean(editingItem)}
				onOpenChange={(open) => !open && setEditingItem(null)}
			>
				<Form {...editForm}>
					<form id={`${title}-edit-form`} onSubmit={handleUpdate}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Edit {title.toLowerCase()}</DialogTitle>
								<DialogDescription>{description}</DialogDescription>
							</DialogHeader>
							<div className="grid gap-4 py-2">
								{renderFormFields(editForm, "edit")}
							</div>
							<DialogFooter>
								<DialogClose asChild>
									<Button
										type="button"
										variant="outline"
										disabled={editForm.formState.isSubmitting}
									>
										Cancel
									</Button>
								</DialogClose>
								<Button
									type="submit"
									form={`${title}-edit-form`}
									disabled={editForm.formState.isSubmitting}
								>
									Save
								</Button>
							</DialogFooter>
						</DialogContent>
					</form>
				</Form>
			</Dialog>

			<Dialog
				open={Boolean(deletingItem)}
				onOpenChange={(open) => !open && setDeletingItem(null)}
			>
				<Form {...deleteForm}>
					<form id={`${title}-delete-form`} onSubmit={handleDelete}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Are you sure?</DialogTitle>
								<DialogDescription>
									{deletingItem
										? isDeleteBlocked?.(deletingItem)
											? (getDeleteBlockedDescription?.(deletingItem) ??
												"This item is used by one or more specimens and cannot be deleted.")
											: getDeleteDescription(deletingItem)
										: ""}
								</DialogDescription>
							</DialogHeader>
							<DialogFooter>
								<DialogClose asChild>
									<Button
										type="button"
										variant="outline"
										disabled={deleteForm.formState.isSubmitting}
									>
										Cancel
									</Button>
								</DialogClose>
								<Button
									type="submit"
									form={`${title}-delete-form`}
									variant="destructive"
									disabled={
										deleteForm.formState.isSubmitting ||
										(deletingItem
											? (isDeleteBlocked?.(deletingItem) ?? false)
											: false)
									}
								>
									Delete
								</Button>
							</DialogFooter>
						</DialogContent>
					</form>
				</Form>
			</Dialog>
		</Card>
	);
}

export default function ReferenceDataManager() {
	const queryClient = useQueryClient();
	const failureModeParams = {
		dowel: true,
		connector: true,
		skip: 0,
		limit: LARGE_LIMIT,
	};

	const { data: failureModesResponse, isLoading: isFailureModesLoading } =
		useFailuremodeGetModes(failureModeParams);
	const { data: joineryTypesResponse, isLoading: isJoineryTypesLoading } =
		useJoinerytypeGetJtypes({ skip: 0, limit: LARGE_LIMIT });
	const { data: subJoineryTypesResponse, isLoading: isSubJoineryTypesLoading } =
		useSubjoinerytypeGetSjtypes({ skip: 0, limit: LARGE_LIMIT });
	const { data: fastenerTypesResponse, isLoading: isFastenerTypesLoading } =
		useFastenertypeGetFastenerTypes({ skip: 0, limit: LARGE_LIMIT });
	const {
		data: loadingDirectionsResponse,
		isLoading: isLoadingDirectionsLoading,
	} = useLoadingdirectionGetLoadingDirections({ skip: 0, limit: LARGE_LIMIT });
	const { data: specimensResponse, isLoading: isSpecimensLoading } =
		useSpecimensReadSpecimens({
			skip: 0,
			limit: SPECIMEN_USAGE_LIMIT,
		});

	const createFailureMode = useFailuremodeCreateMode();
	const updateFailureMode = useFailuremodeUpdateMode();
	const deleteFailureMode = useFailuremodeDeleteMode();
	const createJoineryType = useJoinerytypeCreateJtype();
	const updateJoineryType = useJoinerytypeUpdateJtype();
	const deleteJoineryType = useJoinerytypeDeleteJtype();
	const createSubJoineryType = useSubjoinerytypeCreateSjtype();
	const updateSubJoineryType = useSubjoinerytypeUpdateSjtype();
	const deleteSubJoineryType = useSubjoinerytypeDeleteSjtype();
	const createFastenerType = useFastenertypeCreateFastenerType();
	const updateFastenerType = useFastenertypeUpdateFastenerType();
	const deleteFastenerType = useFastenertypeDeleteFastenerType();
	const createLoadingDirection = useLoadingdirectionCreateLoadingDirection();
	const updateLoadingDirection = useLoadingdirectionUpdateLoadingDirection();
	const deleteLoadingDirection = useLoadingdirectionDeleteLoadingDirection();

	const failureModes = useMemo(
		() =>
			(failureModesResponse?.data ?? [])
				.slice()
				.sort((left, right) => left.label.localeCompare(right.label)),
		[failureModesResponse],
	);
	const joineryTypes = useMemo(
		() =>
			(joineryTypesResponse?.data ?? [])
				.slice()
				.sort((left, right) => left.label.localeCompare(right.label)),
		[joineryTypesResponse],
	);
	const fastenerTypes = useMemo(
		() =>
			(fastenerTypesResponse?.data ?? [])
				.slice()
				.sort((left, right) => left.label.localeCompare(right.label)),
		[fastenerTypesResponse],
	);
	const loadingDirections = useMemo(
		() =>
			(loadingDirectionsResponse?.data ?? [])
				.slice()
				.sort((left, right) => left.label.localeCompare(right.label)),
		[loadingDirectionsResponse],
	);
	const specimenUsage = useMemo(() => {
		const joineryTypeIds = new Set<string>();
		const subJoineryTypeIds = new Set<string>();
		const fastenerTypeIds = new Set<string>();
		const loadingDirectionIds = new Set<string>();
		const failureModeIds = new Set<string>();

		for (const specimen of specimensResponse?.data ?? []) {
			if (specimen.joinery_type.id) {
				joineryTypeIds.add(specimen.joinery_type.id);
			}
			if (specimen.sub_joinery_type.id) {
				subJoineryTypeIds.add(specimen.sub_joinery_type.id);
			}

			for (const fastenerType of specimen.fastener_types) {
				if (fastenerType.id) {
					fastenerTypeIds.add(fastenerType.id);
				}
			}

			for (const loadingDirection of specimen.loading_directions) {
				if (loadingDirection.id) {
					loadingDirectionIds.add(loadingDirection.id);
				}
			}

			for (const failureMode of specimen.e_qualitative_failure_measure) {
				if (failureMode.id) {
					failureModeIds.add(failureMode.id);
				}
			}
		}

		return {
			joineryTypeIds,
			subJoineryTypeIds,
			fastenerTypeIds,
			loadingDirectionIds,
			failureModeIds,
			isComplete:
				(specimensResponse?.count ?? 0) <=
				(specimensResponse?.data.length ?? 0),
		};
	}, [specimensResponse]);

	const isDeleteCheckPending = isSpecimensLoading || !specimenUsage.isComplete;
	const getDeleteBlockedDescription = (label: string) =>
		isSpecimensLoading
			? `Delete is temporarily disabled while specimen usage is being checked for "${label}".`
			: `Cannot delete "${label}" because one or more specimens still use it.`;

	const joineryLabelById = useMemo(
		() =>
			new Map(joineryTypes.map((item) => [item.id ?? "", item.label] as const)),
		[joineryTypes],
	);
	const subJoineryTypes = useMemo(
		() =>
			(subJoineryTypesResponse?.data ?? []).slice().sort((left, right) => {
				const leftGroup = joineryLabelById.get(left.joinery_type_id) ?? "";
				const rightGroup = joineryLabelById.get(right.joinery_type_id) ?? "";
				return (
					leftGroup.localeCompare(rightGroup) ||
					left.label.localeCompare(right.label)
				);
			}),
		[subJoineryTypesResponse, joineryLabelById],
	);

	const invalidateFailureModes = () =>
		queryClient.invalidateQueries({
			queryKey: getFailuremodeGetModesQueryKey(failureModeParams),
		});
	const invalidateJoineryTypes = () =>
		queryClient.invalidateQueries({
			queryKey: getJoinerytypeGetJtypesQueryKey({
				skip: 0,
				limit: LARGE_LIMIT,
			}),
		});
	const invalidateSubJoineryTypes = () =>
		queryClient.invalidateQueries({
			queryKey: getSubjoinerytypeGetSjtypesQueryKey({
				skip: 0,
				limit: LARGE_LIMIT,
			}),
		});
	const invalidateFastenerTypes = () =>
		queryClient.invalidateQueries({
			queryKey: getFastenertypeGetFastenerTypesQueryKey({
				skip: 0,
				limit: LARGE_LIMIT,
			}),
		});
	const invalidateLoadingDirections = () =>
		queryClient.invalidateQueries({
			queryKey: getLoadingdirectionGetLoadingDirectionsQueryKey({
				skip: 0,
				limit: LARGE_LIMIT,
			}),
		});

	return (
		<div className="space-y-6">
			<ReferenceSection<FailureMode, FailureModeCreate>
				title="Failure modes"
				description="Manage the failure mode labels and their type classification."
				items={failureModes}
				isLoading={isFailureModesLoading}
				createLabel="Add failure mode"
				getItemId={(item) => item.id ?? item.label}
				getDeleteDescription={(item) =>
					`Delete "${item.label}"? This cannot be undone, and the backend will block removal if specimens still reference it.`
				}
				getDeleteBlockedDescription={(item) =>
					getDeleteBlockedDescription(item.label)
				}
				isDeleteBlocked={(item) =>
					isDeleteCheckPending ||
					(item.id ? specimenUsage.failureModeIds.has(item.id) : false)
				}
				columns={[
					{ header: "Label", render: (item) => item.label },
					{
						header: "Type",
						render: (item) => <Badge variant="outline">{item.type}</Badge>,
					},
				]}
				createDefaultValues={{ label: "", type: FailureModeType.WOOD }}
				getEditDefaultValues={(item) => ({
					label: item.label,
					type: item.type,
				})}
				renderFormFields={(form) => (
					<>
						<FormField
							control={form.control}
							name={"label"}
							rules={{ required: "Label is required" }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Label</FormLabel>
									<FormControl>
										<Input {...field} value={field.value ?? ""} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name={"type"}
							rules={{ required: "Type is required" }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Type</FormLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<FormControl>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select a type" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{Object.values(FailureModeType).map((option) => (
												<SelectItem key={option} value={option}>
													{option}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
					</>
				)}
				onCreate={(values) => createFailureMode.mutateAsync({ data: values })}
				onUpdate={(id, values) =>
					updateFailureMode.mutateAsync({ id, data: values })
				}
				onDelete={(id) => deleteFailureMode.mutateAsync({ id })}
				onInvalidate={invalidateFailureModes}
			/>

			<ReferenceSection<JoineryType, JoineryTypeCreate>
				title="Joinery types"
				description="Manage high-level joinery categories and whether they use dowels."
				items={joineryTypes}
				isLoading={isJoineryTypesLoading}
				createLabel="Add joinery type"
				getItemId={(item) => item.id ?? item.label}
				getDeleteDescription={(item) =>
					`Delete "${item.label}"? The backend will reject the request if any specimen still references this joinery type.`
				}
				getDeleteBlockedDescription={(item) =>
					getDeleteBlockedDescription(item.label)
				}
				isDeleteBlocked={(item) =>
					isDeleteCheckPending ||
					(item.id ? specimenUsage.joineryTypeIds.has(item.id) : false)
				}
				columns={[
					{ header: "Label", render: (item) => item.label },
					{
						header: "Has dowel",
						render: (item) => (
							<Badge variant={item.has_dowel ? "default" : "outline"}>
								{item.has_dowel ? "Yes" : "No"}
							</Badge>
						),
					},
				]}
				createDefaultValues={{ label: "", has_dowel: false }}
				getEditDefaultValues={(item) => ({
					label: item.label,
					has_dowel: item.has_dowel,
				})}
				renderFormFields={(form) => (
					<>
						<FormField
							control={form.control}
							name={"label"}
							rules={{ required: "Label is required" }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Label</FormLabel>
									<FormControl>
										<Input {...field} value={field.value ?? ""} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name={"has_dowel"}
							render={({ field }) => (
								<FormItem className="flex flex-row items-center gap-3 rounded-md border p-3">
									<FormControl>
										<Checkbox
											checked={field.value ?? false}
											onCheckedChange={(checked) =>
												field.onChange(Boolean(checked))
											}
										/>
									</FormControl>
									<div className="space-y-1">
										<FormLabel className="text-sm font-medium">
											Has dowel
										</FormLabel>
										<p className="text-sm text-muted-foreground">
											Marks whether this joinery type uses dowels by default.
										</p>
									</div>
								</FormItem>
							)}
						/>
					</>
				)}
				onCreate={(values) => createJoineryType.mutateAsync({ data: values })}
				onUpdate={(id, values) =>
					updateJoineryType.mutateAsync({ id, data: values })
				}
				onDelete={(id) => deleteJoineryType.mutateAsync({ id })}
				onInvalidate={async () => {
					await invalidateJoineryTypes();
					await invalidateSubJoineryTypes();
				}}
			/>

			<ReferenceSection<SubJoineryType, SubJoineryTypeCreate>
				title="Sub-joinery types"
				description="Manage detailed joinery labels and link each one to its parent joinery type."
				items={subJoineryTypes}
				isLoading={isSubJoineryTypesLoading || isJoineryTypesLoading}
				createLabel="Add sub-joinery type"
				getItemId={(item) => item.id ?? `${item.joinery_type_id}-${item.label}`}
				getDeleteDescription={(item) =>
					`Delete "${item.label}"? The backend will reject the request if any specimen still references this sub-joinery type.`
				}
				getDeleteBlockedDescription={(item) =>
					getDeleteBlockedDescription(item.label)
				}
				isDeleteBlocked={(item) =>
					isDeleteCheckPending ||
					(item.id ? specimenUsage.subJoineryTypeIds.has(item.id) : false)
				}
				columns={[
					{ header: "Label", render: (item) => item.label },
					{
						header: "Parent joinery type",
						render: (item) =>
							joineryLabelById.get(item.joinery_type_id) ??
							"Unknown joinery type",
					},
				]}
				createDefaultValues={{
					label: "",
					joinery_type_id: joineryTypes[0]?.id ?? "",
				}}
				getEditDefaultValues={(item) => ({
					label: item.label,
					joinery_type_id: item.joinery_type_id,
				})}
				renderFormFields={(form) => (
					<>
						<FormField
							control={form.control}
							name={"label"}
							rules={{ required: "Label is required" }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Label</FormLabel>
									<FormControl>
										<Input {...field} value={field.value ?? ""} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name={"joinery_type_id"}
							rules={{ required: "Joinery type is required" }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Parent joinery type</FormLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<FormControl>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select a joinery type" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{joineryTypes.map((option) => (
												<SelectItem key={option.id} value={option.id ?? ""}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
					</>
				)}
				onCreate={(values) =>
					createSubJoineryType.mutateAsync({ data: values })
				}
				onUpdate={(id, values) =>
					updateSubJoineryType.mutateAsync({ id, data: values })
				}
				onDelete={(id) => deleteSubJoineryType.mutateAsync({ id })}
				onInvalidate={invalidateSubJoineryTypes}
			/>

			<ReferenceSection<FastenerType, FastenerTypeCreate>
				title="Fastener types"
				description="Manage the fastener labels available to specimens."
				items={fastenerTypes}
				isLoading={isFastenerTypesLoading}
				createLabel="Add fastener type"
				getItemId={(item) => item.id ?? item.label}
				getDeleteDescription={(item) =>
					`Delete "${item.label}"? The backend will reject the request if specimens still reference this fastener type.`
				}
				getDeleteBlockedDescription={(item) =>
					getDeleteBlockedDescription(item.label)
				}
				isDeleteBlocked={(item) =>
					isDeleteCheckPending ||
					(item.id ? specimenUsage.fastenerTypeIds.has(item.id) : false)
				}
				columns={[{ header: "Label", render: (item) => item.label }]}
				createDefaultValues={{ label: "" }}
				getEditDefaultValues={(item) => ({ label: item.label })}
				renderFormFields={(form) => (
					<FormField
						control={form.control}
						name={"label"}
						rules={{ required: "Label is required" }}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Label</FormLabel>
								<FormControl>
									<Input {...field} value={field.value ?? ""} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}
				onCreate={(values) => createFastenerType.mutateAsync({ data: values })}
				onUpdate={(id, values) =>
					updateFastenerType.mutateAsync({ id, data: values })
				}
				onDelete={(id) => deleteFastenerType.mutateAsync({ id })}
				onInvalidate={invalidateFastenerTypes}
			/>

			<ReferenceSection<LoadingDirection, LoadingDirectionCreate>
				title="Loading directions"
				description="Manage the loading direction labels available to specimens."
				items={loadingDirections}
				isLoading={isLoadingDirectionsLoading}
				createLabel="Add loading direction"
				getItemId={(item) => item.id ?? item.label}
				getDeleteDescription={(item) =>
					`Delete "${item.label}"? The backend will reject the request if specimens still reference this loading direction.`
				}
				getDeleteBlockedDescription={(item) =>
					getDeleteBlockedDescription(item.label)
				}
				isDeleteBlocked={(item) =>
					isDeleteCheckPending ||
					(item.id ? specimenUsage.loadingDirectionIds.has(item.id) : false)
				}
				columns={[{ header: "Label", render: (item) => item.label }]}
				createDefaultValues={{ label: "" }}
				getEditDefaultValues={(item) => ({ label: item.label })}
				renderFormFields={(form) => (
					<FormField
						control={form.control}
						name={"label"}
						rules={{ required: "Label is required" }}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Label</FormLabel>
								<FormControl>
									<Input {...field} value={field.value ?? ""} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}
				onCreate={(values) =>
					createLoadingDirection.mutateAsync({ data: values })
				}
				onUpdate={(id, values) =>
					updateLoadingDirection.mutateAsync({ id, data: values })
				}
				onDelete={(id) => deleteLoadingDirection.mutateAsync({ id })}
				onInvalidate={invalidateLoadingDirections}
			/>
		</div>
	);
}
