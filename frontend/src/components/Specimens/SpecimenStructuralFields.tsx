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
import { cn } from "@/lib/utils";

interface SpecimenStructuralFormProps {
	control: Control<AddNewSpecimenFormValues>;
	changedFields?: Set<keyof AddNewSpecimenFormValues>;
}

const changedControlClassName =
	"border-emerald-500 text-emerald-700 focus-visible:border-emerald-600 focus-visible:ring-emerald-200/50 dark:border-emerald-700 dark:text-emerald-400";

// ─── Helper: text input field ─────────────────────────────────────────────────

export function TextField({
	name,
	label,
	description,
	control,
	placeholder,
	changed = false,
}: {
	name: keyof AddNewSpecimenFormValues;
	label: string;
	description?: string;
	control: Control<AddNewSpecimenFormValues>;
	placeholder?: string;
	changed?: boolean;
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
						className={cn(changed && changedControlClassName)}
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
	changedFields,
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
				changed={changedFields?.has("element_dimension")}
			/>

			<TextField
				name="moisture_percentage"
				label="Moisture Content"
				description="e.g. 12%"
				control={control}
				placeholder="12%"
				changed={changedFields?.has("moisture_percentage")}
			/>

			<TextField
				name="wood_type"
				label="Wood Type"
				description="Species or grade, e.g. Douglas Fir GL24h"
				control={control}
				placeholder="Douglas Fir GL24h"
				changed={changedFields?.has("wood_type")}
			/>

			<TextField
				name="wood_mechanical_properties"
				label="Wood Mechanical Properties"
				description="Free-text description of wood mechanical properties"
				control={control}
				changed={changedFields?.has("wood_mechanical_properties")}
			/>

			<TextField
				name="fastener_mechanical_properties"
				label="Fastener Mechanical Properties"
				description="Free-text description of fastener mechanical properties"
				control={control}
				changed={changedFields?.has("fastener_mechanical_properties")}
			/>

			<TextField
				name="connector_mechanical_properties"
				label="Connector Mechanical Properties"
				description="Free-text description of connector mechanical properties (if applicable)"
				control={control}
				changed={changedFields?.has("connector_mechanical_properties")}
			/>
		</FieldGroup>
	);
}
