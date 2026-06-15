import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { type Control, Controller, useWatch } from "react-hook-form";
import { useFailuremodeGetModes } from "@/api/endpoints/failuremode/failuremode";
import type { FailureMode } from "@/api/model";
import QFMTypes from "@/assets/failures.svg?react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";
import { cn } from "@/lib/utils";
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
import { changedControlClassName } from "./changedFieldStyles";
import { FieldHelpHover } from "./FieldHelpHover";
import { SpecimenTextField } from "./SpecimenTextField";

interface SpecimenExperimentalFormProps {
	control: Control<AddNewSpecimenFormValues>;
	changedFields?: Set<keyof AddNewSpecimenFormValues>;
	initialQFMOptions?: FailureMode[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TEST_LOADING_TYPES = [
	"Cyclic",
	"Monotonic",
	"Monotonic and Cyclic",
] as const;
const YIELD_POINT_METHODS = ["CEN 1/6", "EEEP"] as const;

// ─── Helper: numeric input field ─────────────────────────────────────────────

function NumericField({
	name,
	label,
	description,
	control,
	unit,
	changed = false,
}: {
	name: keyof AddNewSpecimenFormValues;
	label: string;
	description?: string;
	control: Control<AddNewSpecimenFormValues>;
	unit?: string;
	changed?: boolean;
}) {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState }) => (
				<Field data-invalid={fieldState.invalid}>
					<FieldLabel htmlFor={name}>
						{label}
						{unit && (
							<span className="text-muted-foreground font-normal ml-1">
								({unit})
							</span>
						)}
					</FieldLabel>
					<Input
						id={name}
						type="number"
						step="any"
						value={typeof field.value === "number" ? field.value : ""}
						onChange={(e) =>
							// NaN when the input is cleared — treat as null so the schema
							// sees null (optional) rather than NaN (which fails z.number()).
							field.onChange(
								e.target.value === "" ? null : e.target.valueAsNumber,
							)
						}
						aria-invalid={fieldState.invalid}
						className={cn(
							"w-full max-w-48",
							changed && changedControlClassName,
						)}
					/>
					{description && <FieldDescription>{description}</FieldDescription>}
					{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
				</Field>
			)}
		/>
	);
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SpecimenExperimentalFields({
	control,
	changedFields,
	initialQFMOptions = [],
}: SpecimenExperimentalFormProps) {
	const anchor = useComboboxAnchor();
	const hasConnector = useWatch({
		control,
		name: "connector",
	});
	const hasDowel = useWatch({
		control,
		name: "dowel",
	});
	const { data: QFMData, refetch: refetchQFM } = useFailuremodeGetModes(
		{ connector: hasConnector, dowel: hasDowel },
		{
			query: {
				enabled:
					typeof hasConnector === "boolean" && typeof hasDowel === "boolean",
			},
		},
	);
	const QFMList = [...initialQFMOptions, ...(QFMData?.data ?? [])].filter(
		(qfm, index, list) =>
			list.findIndex((candidate) => candidate.id === qfm.id) === index,
	);
	return (
		<FieldGroup>
			{/* ── Experimental Results ─────────────────────────────────────── */}
			<p className="text-sm font-semibold text-foreground">
				Experimental Results
			</p>

			<div className="grid grid-cols-2 gap-x-6 gap-y-2">
				<NumericField
					name="e_stiffness"
					label="Stiffness (Ks)"
					unit="kN/mm"
					control={control}
					changed={changedFields?.has("e_stiffness")}
				/>
				<NumericField
					name="e_ductility"
					label="Ductility (μ)"
					control={control}
					changed={changedFields?.has("e_ductility")}
				/>
				<NumericField
					name="e_yield_force"
					label="Yield Force (Fy)"
					unit="kN"
					control={control}
					changed={changedFields?.has("e_yield_force")}
				/>
				<NumericField
					name="e_yield_displacement"
					label="Yield Displacement (Δy)"
					unit="mm"
					control={control}
					changed={changedFields?.has("e_yield_displacement")}
				/>
				<NumericField
					name="e_max_force"
					label="Max Force (Fmax)"
					unit="kN"
					control={control}
					changed={changedFields?.has("e_max_force")}
				/>
				<NumericField
					name="e_max_displacement"
					label="Max Displacement (Δmax)"
					unit="mm"
					control={control}
					changed={changedFields?.has("e_max_displacement")}
				/>
				<NumericField
					name="e_ultimate_force"
					label="Ultimate Force (Fu)"
					unit="kN"
					control={control}
					changed={changedFields?.has("e_ultimate_force")}
				/>
				<NumericField
					name="e_ultimate_displacement"
					label="Ultimate Displacement (Δu)"
					unit="mm"
					control={control}
					changed={changedFields?.has("e_ultimate_displacement")}
				/>
			</div>

			<FieldSeparator />

			{/* ── Test Metadata ─────────────────────────────────────────────── */}
			<p className="text-sm font-semibold text-foreground">Test Metadata</p>

			<Controller
				name="e_test_loading_type"
				control={control}
				render={({ field, fieldState }) => (
					<Field data-invalid={fieldState.invalid}>
						<FieldLabel htmlFor="e_test_loading_type">Loading Type</FieldLabel>
						<Select
							value={field.value ?? ""}
							onValueChange={(v) => field.onChange(v || null)}
						>
							<SelectTrigger
								id="e_test_loading_type"
								className={cn(
									"w-full max-w-64",
									changedFields?.has("e_test_loading_type") &&
										changedControlClassName,
								)}
							>
								<SelectValue placeholder="Select loading type" />
							</SelectTrigger>
							<SelectContent>
								{TEST_LOADING_TYPES.map((t) => (
									<SelectItem key={t} value={t}>
										{t}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
					</Field>
				)}
			/>

			<Controller
				name="e_yield_point_method"
				control={control}
				render={({ field, fieldState }) => (
					<Field data-invalid={fieldState.invalid}>
						<FieldLabel htmlFor="e_yield_point_method">
							Yield Point Method
						</FieldLabel>
						<Select
							value={field.value ?? ""}
							onValueChange={(v) => field.onChange(v || null)}
						>
							<SelectTrigger
								id="e_yield_point_method"
								className={cn(
									"w-full max-w-64",
									changedFields?.has("e_yield_point_method") &&
										changedControlClassName,
								)}
							>
								<SelectValue placeholder="Select method" />
							</SelectTrigger>
							<SelectContent>
								{YIELD_POINT_METHODS.map((m) => (
									<SelectItem key={m} value={m}>
										{m}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
					</Field>
				)}
			/>

			<Controller
				name="e_date"
				control={control}
				render={({ field, fieldState }) => (
					<Field data-invalid={fieldState.invalid}>
						<FieldLabel htmlFor="e_date">Test Date</FieldLabel>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									id="e_date"
									type="button"
									variant="outline"
									aria-invalid={fieldState.invalid}
									className={cn(
										"w-full max-w-64 justify-between font-normal",
										changedFields?.has("e_date") && changedControlClassName,
									)}
								>
									{field.value
										? format(parseISO(field.value), "PPP")
										: "Select test date"}
									<CalendarIcon className="h-4 w-4 text-muted-foreground" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<Calendar
									mode="single"
									selected={
										field.value ? parseISO(field.value as string) : undefined
									}
									onSelect={(date) =>
										field.onChange(date ? format(date, "yyyy-MM-dd") : "")
									}
								/>
							</PopoverContent>
						</Popover>
						{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
					</Field>
				)}
			/>

			<FieldSeparator />

			{/* ── Qualitative Failure Measures ─────────────────────────────────────────────── */}
			<p className="text-sm font-semibold text-foreground">
				Qualitative Failure Measures
			</p>

			<Controller
				name="e_qualitative_failure_measure"
				control={control}
				render={({ field, fieldState }) => {
					const values = Array.isArray(field.value) ? field.value : [];
					return (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor="e_qualitative_failure_measure">
								QFM{" "}
								<FieldHelpHover
									content={<QFMTypes className="w-3xl h-auto max-h-96" />}
								/>
							</FieldLabel>
							<Combobox
								multiple
								items={QFMList}
								onValueChange={(selectedValues) =>
									field.onChange(selectedValues)
								}
								onOpenChange={(isOpen) => {
									if (isOpen && !QFMData?.data?.length) {
										// Trigger fetch when opened AND no data
										refetchQFM(); // your query refetch function
									}
								}}
								itemToStringValue={(qfm) =>
									(qfm as unknown as FailureMode & { id: string }).id
								}
								value={values}
							>
								<ComboboxChips
									ref={anchor}
									className={cn(
										"w-full max-w-xs",
										changedFields?.has("e_qualitative_failure_measure") &&
											changedControlClassName,
									)}
								>
									<ComboboxValue>
										{(chips) => (
											<>
												{(chips as string[]).map((chipId) => {
													// Lookup label by ID from your data
													const qfm = QFMList.find((f) => f.id === chipId);
													return (
														<ComboboxChip key={chipId}>
															{qfm?.label ?? ""}
														</ComboboxChip>
													);
												})}
												<ComboboxChipsInput />
											</>
										)}
									</ComboboxValue>
								</ComboboxChips>
								<ComboboxContent anchor={anchor}>
									<ComboboxEmpty>No fastener types found.</ComboboxEmpty>
									<ComboboxList>
										{(qfm) => (
											<ComboboxItem key={qfm.id} value={qfm.id}>
												{qfm.label}
											</ComboboxItem>
										)}
									</ComboboxList>
								</ComboboxContent>
							</Combobox>
							<FieldDescription>
								Select the Qualitative failure modes.
							</FieldDescription>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					);
				}}
			/>

			<SpecimenTextField
				name="e_qfm_description"
				label="Qualitative Failure Mode Description"
				description="Free-text description of the observed failure mode"
				control={control}
				isChanged={changedFields?.has("e_qfm_description")}
			/>
		</FieldGroup>
	);
}
