import type { Control } from "react-hook-form";
import { FieldGroup } from "@/components/ui/field";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";
import { SpecimenTextField } from "./SpecimenTextField";

interface SpecimenStructuralFormProps {
	control: Control<AddNewSpecimenFormValues>;
	changedFields?: Set<keyof AddNewSpecimenFormValues>;
}

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

			<SpecimenTextField
				name="element_dimension"
				label="Element Dimension"
				description="e.g. 90×45, 120×60"
				control={control}
				placeholder="90×45"
				isChanged={changedFields?.has("element_dimension")}
			/>

			<SpecimenTextField
				name="moisture_percentage"
				label="Moisture Content"
				description="e.g. 12%"
				control={control}
				placeholder="12%"
				isChanged={changedFields?.has("moisture_percentage")}
			/>

			<SpecimenTextField
				name="wood_type"
				label="Wood Type"
				description="Species or grade, e.g. Douglas Fir GL24h"
				control={control}
				placeholder="Douglas Fir GL24h"
				isChanged={changedFields?.has("wood_type")}
			/>

			<SpecimenTextField
				name="wood_mechanical_properties"
				label="Wood Mechanical Properties"
				description="Free-text description of wood mechanical properties"
				control={control}
				isChanged={changedFields?.has("wood_mechanical_properties")}
			/>

			<SpecimenTextField
				name="fastener_mechanical_properties"
				label="Fastener Mechanical Properties"
				description="Free-text description of fastener mechanical properties"
				control={control}
				isChanged={changedFields?.has("fastener_mechanical_properties")}
			/>

			<SpecimenTextField
				name="connector_mechanical_properties"
				label="Connector Mechanical Properties"
				description="Free-text description of connector mechanical properties (if applicable)"
				control={control}
				isChanged={changedFields?.has("connector_mechanical_properties")}
			/>
		</FieldGroup>
	);
}
