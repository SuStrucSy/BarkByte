import { type Control, Controller, useWatch } from "react-hook-form";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useFailuremodeGetModes } from "@/api/endpoints/failuremode/failuremode";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";
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
import { FieldHelpHover } from "./FieldHelpHover";
import { TextField } from "./SpecimenStructuralFields";

interface SpecimenExperimentalFormProps {
	control: Control<AddNewSpecimenFormValues>;
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
}: {
	name: keyof AddNewSpecimenFormValues;
	label: string;
	description?: string;
	control: Control<AddNewSpecimenFormValues>;
	unit?: string;
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
						value={field.value ?? ""}
						onChange={(e) =>
							// NaN when the input is cleared — treat as null so the schema
							// sees null (optional) rather than NaN (which fails z.number()).
							field.onChange(
								e.target.value === "" ? null : e.target.valueAsNumber,
							)
						}
						aria-invalid={fieldState.invalid}
						className="w-full max-w-48"
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
		{ query: { enabled: false } },
	);
	const QFMList = QFMData?.data || [];
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
				/>
				<NumericField
					name="e_ductility"
					label="Ductility (μ)"
					control={control}
				/>
				<NumericField
					name="e_yield_force"
					label="Yield Force (Fy)"
					unit="kN"
					control={control}
				/>
				<NumericField
					name="e_yield_displacement"
					label="Yield Displacement (Δy)"
					unit="mm"
					control={control}
				/>
				<NumericField
					name="e_max_force"
					label="Max Force (Fmax)"
					unit="kN"
					control={control}
				/>
				<NumericField
					name="e_max_displacement"
					label="Max Displacement (Δmax)"
					unit="mm"
					control={control}
				/>
				<NumericField
					name="e_ultimate_force"
					label="Ultimate Force (Fu)"
					unit="kN"
					control={control}
				/>
				<NumericField
					name="e_ultimate_displacement"
					label="Ultimate Displacement (Δu)"
					unit="mm"
					control={control}
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
								className="w-full max-w-64"
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
								className="w-full max-w-64"
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
									className="w-full max-w-64 justify-between font-normal"
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
									if (isOpen && !QFMList.length) {
										// Trigger fetch when opened AND no data
										refetchQFM(); // your query refetch function
									}
								}}
								itemToStringValue={(qfm) => qfm.id}
								value={values}
							>
								<ComboboxChips ref={anchor} className="w-full max-w-xs">
									<ComboboxValue>
										{(chips) => (
											<>
												{chips.map((chipId) => {
													// Lookup label by ID from your data
													const qfm = QFMList.find((f) => f.id === chipId);
													return (
														<ComboboxChip key={chipId}>
															{qfm?.label || chipId}
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

			<TextField
				name="e_qfm_description"
				label="Qualitative Failure Mode Description"
				description="Free-text description of the observed failure mode"
				control={control}
			/>
		</FieldGroup>
	);
}
