import { type Control, Controller } from "react-hook-form";
import type {
	FastenerType,
	JoineryType,
	LoadingDirection,
	SubJoineryType,
} from "@/api/model";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { AssemblyTypeField } from "./AssemblyTypeField";
import { FastenerTypesField } from "./FastenerTypesField";
import { JoineryFields } from "./JoineryFields";
import { LoadingDirectionsField } from "./LoadingDirectionsField";
import { PracticeField } from "./PracticeField";
import { SpecimenReferenceIdField } from "./SpecimenReferenceIdField";
import { useSpecimenDetailsOptions } from "./useSpecimenDetailsOptions";

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
	const {
		selectedJoineryTypeId,
		joineryTypeList,
		subJoineryTypeList,
		fastenerTypeList,
		loadingDirectionList,
	} = useSpecimenDetailsOptions({
		control,
		initialJoineryOptions,
		initialSubJoineryOptions,
		initialFastenerOptions,
		initialLoadingDirectionOptions,
	});

	return (
		<FieldGroup>
			<SpecimenReferenceIdField
				control={control}
				isChanged={changedFields?.has("specimen_reference_id")}
			/>
			<AssemblyTypeField
				control={control}
				isChanged={changedFields?.has("assembly_type")}
			/>
			<JoineryFields
				control={control}
				selectedJoineryTypeId={selectedJoineryTypeId}
				joineryTypeList={joineryTypeList}
				subJoineryTypeList={subJoineryTypeList}
				isJoineryTypeChanged={changedFields?.has("joinery_type_id")}
				isSubJoineryTypeChanged={changedFields?.has("sub_joinery_type_id")}
			/>
			<FastenerTypesField
				control={control}
				fastenerTypeList={fastenerTypeList}
				isChanged={changedFields?.has("fastener_type_ids")}
			/>
			<LoadingDirectionsField
				control={control}
				loadingDirectionList={loadingDirectionList}
				isChanged={changedFields?.has("loading_direction_ids")}
			/>

			<PracticeField
				control={control}
				isChanged={changedFields?.has("practice")}
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
