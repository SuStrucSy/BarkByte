import type { Control } from "react-hook-form";
import type { FailureMode } from "@/api/model";
import QFMTypes from "@/assets/failures.svg?react";
import { FieldGroup, FieldSeparator } from "@/components/ui/field";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";
import { FieldHelpHover } from "./FieldHelpHover";
import { SpecimenDateField } from "./SpecimenDateField";
import { SpecimenMultiComboboxField } from "./SpecimenMultiComboboxField";
import { SpecimenNumberField } from "./SpecimenNumberField";
import { SpecimenSelectField } from "./SpecimenSelectField";
import { SpecimenTextField } from "./SpecimenTextField";
import { useSpecimenExperimentalOptions } from "./useSpecimenExperimentalOptions";

interface SpecimenExperimentalFormProps {
	control: Control<AddNewSpecimenFormValues>;
	changedFields?: Set<keyof AddNewSpecimenFormValues>;
	initialQFMOptions?: FailureMode[];
}

const TEST_LOADING_TYPES = [
	"Cyclic",
	"Monotonic",
	"Monotonic and Cyclic",
] as const;
const YIELD_POINT_METHODS = ["CEN 1/6", "EEEP"] as const;
const TEST_LOADING_TYPE_OPTIONS = TEST_LOADING_TYPES.map((type) => ({
	id: type,
	label: type,
}));
const YIELD_POINT_METHOD_OPTIONS = YIELD_POINT_METHODS.map((method) => ({
	id: method,
	label: method,
}));
const EXPERIMENTAL_NUMBER_FIELDS = [
	{
		name: "e_stiffness",
		label: "Stiffness (Ks)",
		unit: "kN/mm",
	},
	{
		name: "e_ductility",
		label: "Ductility (μ)",
	},
	{
		name: "e_yield_force",
		label: "Yield Force (Fy)",
		unit: "kN",
	},
	{
		name: "e_yield_displacement",
		label: "Yield Displacement (Δy)",
		unit: "mm",
	},
	{
		name: "e_max_force",
		label: "Max Force (Fmax)",
		unit: "kN",
	},
	{
		name: "e_max_displacement",
		label: "Max Displacement (Δmax)",
		unit: "mm",
	},
	{
		name: "e_ultimate_force",
		label: "Ultimate Force (Fu)",
		unit: "kN",
	},
	{
		name: "e_ultimate_displacement",
		label: "Ultimate Displacement (Δu)",
		unit: "mm",
	},
] as const;

export function SpecimenExperimentalFields({
	control,
	changedFields,
	initialQFMOptions = [],
}: SpecimenExperimentalFormProps) {
	const { qfmList } = useSpecimenExperimentalOptions({
		control,
		initialQFMOptions,
	});

	return (
		<FieldGroup>
			<p className="text-sm font-semibold text-foreground">
				Experimental Results
			</p>

			<div className="grid grid-cols-2 gap-x-6 gap-y-2">
				{EXPERIMENTAL_NUMBER_FIELDS.map((field) => (
					<SpecimenNumberField
						key={field.name}
						control={control}
						step="any"
						emptyValue="null"
						className="w-full max-w-48"
						isChanged={changedFields?.has(field.name)}
						{...field}
					/>
				))}
			</div>

			<FieldSeparator />

			<p className="text-sm font-semibold text-foreground">Test Metadata</p>

			<SpecimenSelectField
				control={control}
				name="e_test_loading_type"
				label="Loading Type"
				placeholder="Select loading type"
				options={TEST_LOADING_TYPE_OPTIONS}
				triggerClassName="w-full max-w-64"
				isChanged={changedFields?.has("e_test_loading_type")}
			/>

			<SpecimenSelectField
				control={control}
				name="e_yield_point_method"
				label="Yield Point Method"
				placeholder="Select method"
				options={YIELD_POINT_METHOD_OPTIONS}
				triggerClassName="w-full max-w-64"
				isChanged={changedFields?.has("e_yield_point_method")}
			/>

			<SpecimenDateField
				control={control}
				name="e_date"
				label="Test Date"
				placeholder="Select test date"
				triggerClassName="w-full max-w-64 justify-between font-normal"
				isChanged={changedFields?.has("e_date")}
			/>

			<FieldSeparator />

			<p className="text-sm font-semibold text-foreground">
				Qualitative Failure Measures
			</p>

			<SpecimenMultiComboboxField
				control={control}
				name="e_qualitative_failure_measure"
				label="QFM"
				labelAddon={
					<FieldHelpHover
						content={<QFMTypes className="w-3xl h-auto max-h-96" />}
					/>
				}
				description="Select the Qualitative failure modes."
				emptyMessage="No qualitative failure modes found."
				options={qfmList}
				isChanged={changedFields?.has("e_qualitative_failure_measure")}
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
