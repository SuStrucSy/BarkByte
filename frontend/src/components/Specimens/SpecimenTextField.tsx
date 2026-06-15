import { type Control, Controller } from "react-hook-form";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { changedControlClassName } from "./changedFieldStyles";

type SpecimenTextFieldName =
	| "specimen_reference_id"
	| "element_dimension"
	| "moisture_percentage"
	| "wood_type"
	| "wood_mechanical_properties"
	| "fastener_mechanical_properties"
	| "connector_mechanical_properties"
	| "e_qfm_description";

type SpecimenTextFieldProps = {
	control: Control<AddNewSpecimenFormValues>;
	name: SpecimenTextFieldName;
	label: string;
	description?: string;
	placeholder?: string;
	autoComplete?: string;
	isChanged?: boolean;
};

export function SpecimenTextField({
	control,
	name,
	label,
	description,
	placeholder,
	autoComplete = "off",
	isChanged = false,
}: SpecimenTextFieldProps) {
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
						value={typeof field.value === "string" ? field.value : ""}
						placeholder={placeholder}
						aria-invalid={fieldState.invalid}
						autoComplete={autoComplete}
						className={cn("w-full", isChanged && changedControlClassName)}
					/>
					{description && <FieldDescription>{description}</FieldDescription>}
					{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
				</Field>
			)}
		/>
	);
}
