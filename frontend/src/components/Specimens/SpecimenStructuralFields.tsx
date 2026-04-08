import { type Control, Controller } from "react-hook-form";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";

interface SpecimenStructuralFormProps {
	control: Control<AddNewSpecimenFormValues>;
}

// ─── Helper: text input field ─────────────────────────────────────────────────

export function TextField({
	name,
	label,
	description,
	control,
	placeholder,
}: {
	name: keyof AddNewSpecimenFormValues;
	label: string;
	description?: string;
	control: Control<AddNewSpecimenFormValues>;
	placeholder?: string;
}) {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState }) => (
				<Field data-invalid={fieldState.invalid}>
					<FieldLabel htmlFor={name}>{label}</FieldLabel>
					<Input
						{...field}
						id={name}
						value={(field.value as string) ?? ""}
						placeholder={placeholder}
						aria-invalid={fieldState.invalid}
						autoComplete="off"
					/>
					{description && <FieldDescription>{description}</FieldDescription>}
					{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
				</Field>
			)}
		/>
	);
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SpecimenStructuralFields({
	control,
}: SpecimenStructuralFormProps) {
	return (
		<FieldGroup>
			{/* ── Material Properties ──────────────────────────────────────── */}
			<p className="text-sm font-semibold text-foreground">
				Material Properties
			</p>

			<TextField
				name="element_dimension"
				label="Element Dimension"
				description="e.g. 90×45, 120×60"
				control={control}
				placeholder="90×45"
			/>

			<TextField
				name="moisture_percentage"
				label="Moisture Content"
				description="e.g. 12%"
				control={control}
				placeholder="12%"
			/>

			<TextField
				name="wood_type"
				label="Wood Type"
				description="Species or grade, e.g. Douglas Fir GL24h"
				control={control}
				placeholder="Douglas Fir GL24h"
			/>

			<TextField
				name="wood_mechanical_properties"
				label="Wood Mechanical Properties"
				description="Free-text description of wood mechanical properties"
				control={control}
			/>

			<TextField
				name="fastener_mechanical_properties"
				label="Fastener Mechanical Properties"
				description="Free-text description of fastener mechanical properties"
				control={control}
			/>

			<TextField
				name="connector_mechanical_properties"
				label="Connector Mechanical Properties"
				description="Free-text description of connector mechanical properties (if applicable)"
				control={control}
			/>
		</FieldGroup>
	);
}
