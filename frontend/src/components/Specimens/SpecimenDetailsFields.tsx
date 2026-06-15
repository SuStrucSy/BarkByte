import { type Control, Controller } from "react-hook-form";
import type {
	FastenerType,
	JoineryType,
	LoadingDirection,
	SubJoineryType,
} from "@/api/model";
import buttJoint from "@/assets/joineryTypes/Butt-Joint.png";
import halfLap from "@/assets/joineryTypes/Half-Lap-Joint.png";
import holdDown from "@/assets/joineryTypes/Hold-Down.png";
import plate from "@/assets/joineryTypes/Plate.png";
import slotJoint from "@/assets/joineryTypes/Slot-Joint.png";
import splineJoint from "@/assets/joineryTypes/Spline-Joint.png";
import throughTenon from "@/assets/joineryTypes/Through-Tenon.png";
import joineryTypesReference from "@/assets/joineryTypes.webp";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@/components/ui/field";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { Checkbox } from "../ui/checkbox";
import {
	Combobox,
	ComboboxChip,
	ComboboxChips,
	ComboboxChipsInput,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxItem,
	ComboboxList,
	ComboboxValue,
	useComboboxAnchor,
} from "../ui/combobox";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { AssemblyTypeField } from "./AssemblyTypeField";
import { FieldHelpHover } from "./FieldHelpHover";
import { useSpecimenDetailsOptions } from "./useSpecimenDetailsOptions";

const JOINERY_IMAGES: Record<string, string> = {
	"butt-joint": buttJoint,
	"hold-down": holdDown,
	"through-tenon": throughTenon,
	"half-lap-joint": halfLap,
	plate: plate,
	"slot-joint": slotJoint,
	"spline-joint": splineJoint,
};

const toImageKey = (label: string) => label.toLowerCase().replace(/\s+/g, "-");

interface AddSpecimenFormProps {
	control: Control<AddNewSpecimenFormValues>;
	changedFields?: Set<keyof AddNewSpecimenFormValues>;
	initialJoineryOptions?: JoineryType[];
	initialSubJoineryOptions?: SubJoineryType[];
	initialFastenerOptions?: FastenerType[];
	initialLoadingDirectionOptions?: LoadingDirection[];
}

const changedControlClassName =
	"border-emerald-500 text-emerald-700 focus-visible:border-emerald-600 focus-visible:ring-emerald-200/50 dark:border-emerald-700 dark:text-emerald-400";

export function SpecimenDetailsFields({
	control,
	changedFields,
	initialJoineryOptions = [],
	initialSubJoineryOptions = [],
	initialFastenerOptions = [],
	initialLoadingDirectionOptions = [],
}: AddSpecimenFormProps) {
	const anchorFastener = useComboboxAnchor();
	const anchorLoading = useComboboxAnchor();
	const {
		selectedJoineryTypeId,
		joineryTypeList,
		subJoineryTypeList,
		fastenerTypeList,
		loadingDirectionList,
		hasFetchedFastenerTypes,
		refetchFasteners,
	} = useSpecimenDetailsOptions({
		control,
		initialJoineryOptions,
		initialSubJoineryOptions,
		initialFastenerOptions,
		initialLoadingDirectionOptions,
	});

	return (
		<FieldGroup>
			<Controller
				name="specimen_reference_id"
				control={control}
				render={({ field, fieldState }) => (
					<Field data-invalid={fieldState.invalid}>
						<FieldLabel htmlFor="specimen_reference_id">
							Reference ID
						</FieldLabel>
						<Input
							{...field}
							id="specimen_reference_id"
							aria-invalid={fieldState.invalid}
							autoComplete="off"
							className={cn(
								"w-full",
								changedFields?.has("specimen_reference_id") &&
									changedControlClassName,
							)}
						/>
						{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
					</Field>
				)}
			/>
			<AssemblyTypeField
				control={control}
				isChanged={changedFields?.has("assembly_type")}
			/>
			<Controller
				name="joinery_type_id"
				control={control}
				render={({ field, fieldState }) => {
					const selectedJoinery = joineryTypeList.find(
						(j) => j.id === selectedJoineryTypeId,
					);
					const joineryImage = selectedJoinery
						? JOINERY_IMAGES[toImageKey(selectedJoinery.label)]
						: undefined;

					return (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor="joinery_type_id">
								Joinery Type
								<FieldHelpHover
									title={selectedJoinery?.label}
									content={
										joineryImage ? (
											<img
												src={joineryImage}
												alt={selectedJoinery?.label}
												className="w-48 h-auto"
											/>
										) : (
											<img
												src={joineryTypesReference}
												alt="Reference sheet showing timber joinery and connection types"
												className="w-4xl h-auto"
												decoding="async"
											/>
										) // fallback when nothing selected
									}
								/>
							</FieldLabel>
							<Select
								name={field.name}
								value={field.value}
								onValueChange={field.onChange}
							>
								<SelectTrigger
									id="joinery_type_id"
									aria-invalid={fieldState.invalid}
									className={cn(
										"w-full",
										changedFields?.has("joinery_type_id") &&
											changedControlClassName,
									)}
								>
									<SelectValue placeholder="Choose joinery" />
								</SelectTrigger>
								<SelectContent position="item-aligned">
									{joineryTypeList.map((joinery) => (
										<SelectItem key={joinery.id} value={joinery.id}>
											{joinery.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FieldDescription>Select the joinery type.</FieldDescription>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					);
				}}
			/>
			<Controller
				name="sub_joinery_type_id"
				control={control}
				render={({ field, fieldState }) => (
					<Field data-invalid={fieldState.invalid}>
						<FieldLabel htmlFor="sub_joinery_type_id">
							Sub Joinery Type
						</FieldLabel>
						<Select value={field.value} onValueChange={field.onChange}>
							<SelectTrigger
								id="sub_joinery_type_id"
								className={cn(
									"w-full",
									changedFields?.has("sub_joinery_type_id") &&
										changedControlClassName,
								)}
							>
								<SelectValue placeholder="Choose sub joinery" />
							</SelectTrigger>
							<SelectContent>
								{subJoineryTypeList.map((subJoinery) => (
									<SelectItem key={subJoinery.id} value={subJoinery.id}>
										{subJoinery.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<FieldDescription>
							{selectedJoineryTypeId
								? `Filtered for ${joineryTypeList.find((j) => j.id === selectedJoineryTypeId)?.label}`
								: "Select joinery type first"}
						</FieldDescription>
						{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
					</Field>
				)}
			/>
			<Controller
				name="fastener_type_ids"
				control={control}
				render={({ field, fieldState }) => {
					const values = Array.isArray(field.value) ? field.value : [];
					return (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor="fastener_type_ids">
								Fastener Types
							</FieldLabel>
							<Combobox
								multiple
								items={fastenerTypeList}
								onValueChange={(selectedValues) =>
									field.onChange(selectedValues)
								}
								onOpenChange={(isOpen) => {
									if (isOpen && !hasFetchedFastenerTypes) {
										// Trigger fetch when opened AND no data
										refetchFasteners(); // your query refetch function
									}
								}}
								itemToStringValue={(fastener) =>
									(fastener as unknown as FastenerType & { id: string }).id
								}
								value={values}
							>
								<ComboboxChips
									ref={anchorFastener}
									className={cn(
										"w-full max-w-xs",
										changedFields?.has("fastener_type_ids") &&
											changedControlClassName,
									)}
								>
									<ComboboxValue>
										{(chips) => (
											<>
												{(chips as string[]).map((chipId) => {
													//  Lookup label by ID from your data
													const fastener = fastenerTypeList.find(
														(f) => f.id === chipId,
													);
													return (
														<ComboboxChip key={chipId}>
															{fastener?.label ?? ""}
														</ComboboxChip>
													);
												})}
												<ComboboxChipsInput />
											</>
										)}
									</ComboboxValue>
								</ComboboxChips>
								<ComboboxContent anchor={anchorFastener}>
									<ComboboxEmpty>No fastener types found.</ComboboxEmpty>
									<ComboboxList>
										{(fastener) => (
											<ComboboxItem key={fastener.id} value={fastener.id}>
												{fastener.label}
											</ComboboxItem>
										)}
									</ComboboxList>
								</ComboboxContent>
							</Combobox>
							<FieldDescription>
								Select one or more fastener types
							</FieldDescription>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					);
				}}
			/>
			<Controller
				name="loading_direction_ids"
				control={control}
				render={({ field, fieldState }) => {
					const values = Array.isArray(field.value) ? field.value : [];
					return (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor="loading_direction_ids">
								Loading Direction
							</FieldLabel>
							<Combobox
								multiple
								items={loadingDirectionList}
								onValueChange={(selectedValues) =>
									field.onChange(selectedValues)
								}
								itemToStringValue={(loading) =>
									(loading as unknown as LoadingDirection & { id: string }).id
								}
								value={values}
							>
								<ComboboxChips
									ref={anchorLoading}
									className={cn(
										"w-full max-w-xs",
										changedFields?.has("loading_direction_ids") &&
											changedControlClassName,
									)}
								>
									<ComboboxValue>
										{(chips) => (
											<>
												{(chips as string[]).map((chipId) => {
													//  Lookup label by ID from your data
													const loading = loadingDirectionList.find(
														(f) => f.id === chipId,
													);
													return (
														<ComboboxChip key={chipId}>
															{loading?.label ?? ""}
														</ComboboxChip>
													);
												})}
												<ComboboxChipsInput />
											</>
										)}
									</ComboboxValue>
								</ComboboxChips>
								<ComboboxContent anchor={anchorLoading}>
									<ComboboxEmpty>No loading direction found.</ComboboxEmpty>
									<ComboboxList>
										{(loading) => (
											<ComboboxItem key={loading.id} value={loading.id}>
												{loading.label}
											</ComboboxItem>
										)}
									</ComboboxList>
								</ComboboxContent>
							</Combobox>
							<FieldDescription>
								Select one or more loading directions
							</FieldDescription>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					);
				}}
			/>

			{/* ── Practice ──────────────────────────────────────────────────── */}
			<Controller
				name="practice"
				control={control}
				render={({ field, fieldState }) => (
					<FieldSet data-invalid={fieldState.invalid}>
						<FieldLegend>Practice</FieldLegend>
						<RadioGroup
							name={field.name}
							value={field.value ?? ""}
							onValueChange={field.onChange}
							aria-invalid={fieldState.invalid}
						>
							{(["Conventional", "Research and Development"] as const).map(
								(p) => (
									<Field
										key={p}
										orientation="horizontal"
										data-invalid={fieldState.invalid}
									>
										<RadioGroupItem
											value={p}
											id={p}
											aria-invalid={fieldState.invalid}
											className={cn(
												changedFields?.has("practice") &&
													changedControlClassName,
											)}
										/>
										<FieldLabel htmlFor={p}>{p}</FieldLabel>
									</Field>
								),
							)}
						</RadioGroup>
						{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
					</FieldSet>
				)}
			/>

			{/* ── Connector & Dowel ──────────────────────────────────────────── */}
			<Controller
				name="connector"
				control={control}
				render={({ field, fieldState }) => (
					<Field orientation="horizontal" data-invalid={fieldState.invalid}>
						<Checkbox
							id="connector"
							checked={field.value}
							onCheckedChange={field.onChange}
							className={cn(
								changedFields?.has("connector") && changedControlClassName,
							)}
						/>
						<FieldLabel htmlFor="connector">Has Connector</FieldLabel>
					</Field>
				)}
			/>

			{/* ── Numeric counts ─────────────────────────────────────────────── */}
			<Controller
				name="fastener_numbers"
				control={control}
				render={({ field, fieldState }) => (
					<Field data-invalid={fieldState.invalid}>
						<FieldLabel htmlFor="fastener_numbers">
							Number of Fasteners
						</FieldLabel>
						<Input
							id="fastener_numbers"
							name={field.name}
							ref={field.ref}
							onBlur={field.onBlur}
							type="number"
							min={1}
							step={1}
							value={field.value ?? ""}
							onChange={(e) => field.onChange(e.target.valueAsNumber)}
							aria-invalid={fieldState.invalid}
							className={cn(
								"w-full",
								changedFields?.has("fastener_numbers") &&
									changedControlClassName,
							)}
						/>
						{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
					</Field>
				)}
			/>
			<Controller
				name="replicate_tests"
				control={control}
				render={({ field, fieldState }) => (
					<Field data-invalid={fieldState.invalid}>
						<FieldLabel htmlFor="replicate_tests">Replicate Tests</FieldLabel>
						<Input
							id="replicate_tests"
							name={field.name}
							ref={field.ref}
							onBlur={field.onBlur}
							type="number"
							min={1}
							step={1}
							value={field.value ?? ""}
							onChange={(e) => field.onChange(e.target.valueAsNumber)}
							aria-invalid={fieldState.invalid}
							className={cn(
								"w-full",
								changedFields?.has("replicate_tests") &&
									changedControlClassName,
							)}
						/>
						{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
					</Field>
				)}
			/>

			{/* ── Connection description & note ──────────────────────────────── */}
			<Controller
				name="connection_description"
				control={control}
				render={({ field, fieldState }) => (
					<Field data-invalid={fieldState.invalid}>
						<FieldLabel htmlFor="connection_description">
							Connection Description
						</FieldLabel>
						<Textarea
							{...field}
							id="connection_description"
							value={field.value ?? ""}
							aria-invalid={fieldState.invalid}
							rows={3}
							className={cn(
								changedFields?.has("connection_description") &&
									changedControlClassName,
							)}
						/>
						{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
					</Field>
				)}
			/>
			<Controller
				name="note"
				control={control}
				render={({ field, fieldState }) => (
					<Field data-invalid={fieldState.invalid}>
						<FieldLabel htmlFor="note">Note (optional)</FieldLabel>
						<Textarea
							{...field}
							id="note"
							value={field.value ?? ""}
							aria-invalid={fieldState.invalid}
							rows={2}
							className={cn(
								changedFields?.has("note") && changedControlClassName,
							)}
						/>
						{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
					</Field>
				)}
			/>
		</FieldGroup>
	);
}
