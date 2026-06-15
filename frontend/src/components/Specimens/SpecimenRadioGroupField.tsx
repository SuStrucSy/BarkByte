import { type Control, Controller } from "react-hook-form";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { changedControlClassName } from "./changedFieldStyles";

type SpecimenRadioGroupFieldProps = {
	control: Control<AddNewSpecimenFormValues>;
	name: "assembly_type" | "practice";
	label: string;
	description?: string;
	options: readonly string[];
	isChanged?: boolean;
};

export function SpecimenRadioGroupField({
	control,
	name,
	label,
	description,
	options,
	isChanged = false,
}: SpecimenRadioGroupFieldProps) {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState }) => (
				<FieldSet data-invalid={fieldState.invalid}>
					<FieldLegend>{label}</FieldLegend>
					{description && <FieldDescription>{description}</FieldDescription>}
					<RadioGroup
						name={field.name}
						value={field.value ?? ""}
						onValueChange={field.onChange}
						aria-invalid={fieldState.invalid}
					>
						{options.map((option) => (
							<Field
								key={option}
								orientation="horizontal"
								data-invalid={fieldState.invalid}
							>
								<RadioGroupItem
									value={option}
									id={option}
									aria-invalid={fieldState.invalid}
									className={cn(isChanged && changedControlClassName)}
								/>
								<FieldLabel htmlFor={option}>{option}</FieldLabel>
							</Field>
						))}
					</RadioGroup>
					{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
				</FieldSet>
			)}
		/>
	);
}
