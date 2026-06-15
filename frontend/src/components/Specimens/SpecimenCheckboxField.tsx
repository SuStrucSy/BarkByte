import { type Control, Controller } from "react-hook-form";
import { Field, FieldLabel } from "@/components/ui/field";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { Checkbox } from "../ui/checkbox";
import { changedControlClassName } from "./changedFieldStyles";

type SpecimenCheckboxFieldProps = {
	control: Control<AddNewSpecimenFormValues>;
	name: "connector";
	label: string;
	isChanged?: boolean;
};

export function SpecimenCheckboxField({
	control,
	name,
	label,
	isChanged = false,
}: SpecimenCheckboxFieldProps) {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState }) => (
				<Field orientation="horizontal" data-invalid={fieldState.invalid}>
					<Checkbox
						id={name}
						checked={field.value}
						onCheckedChange={field.onChange}
						className={cn(isChanged && changedControlClassName)}
					/>
					<FieldLabel htmlFor={name}>{label}</FieldLabel>
				</Field>
			)}
		/>
	);
}
