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
import { ASSEMBLY_TYPES } from "@/lib/constants";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type AssemblyTypeFieldProps = {
	control: Control<AddNewSpecimenFormValues>;
	isChanged?: boolean;
};

const changedControlClassName =
	"border-emerald-500 text-emerald-700 focus-visible:border-emerald-600 focus-visible:ring-emerald-200/50 dark:border-emerald-700 dark:text-emerald-400";

export function AssemblyTypeField({
	control,
	isChanged = false,
}: AssemblyTypeFieldProps) {
	return (
		<Controller
			name="assembly_type"
			control={control}
			render={({ field, fieldState }) => (
				<FieldSet data-invalid={fieldState.invalid}>
					<FieldLegend>Assembly Type</FieldLegend>
					<FieldDescription>Select how specimen is assembled</FieldDescription>
					<RadioGroup
						name={field.name}
						value={field.value}
						onValueChange={field.onChange}
						aria-invalid={fieldState.invalid}
					>
						{ASSEMBLY_TYPES.map((type) => (
							<Field
								key={type}
								orientation="horizontal"
								data-invalid={fieldState.invalid}
							>
								<RadioGroupItem
									value={type}
									id={type}
									aria-invalid={fieldState.invalid}
									className={cn(isChanged && changedControlClassName)}
								/>
								<FieldLabel htmlFor={type}>{type}</FieldLabel>
							</Field>
						))}
					</RadioGroup>
					{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
				</FieldSet>
			)}
		/>
	);
}
