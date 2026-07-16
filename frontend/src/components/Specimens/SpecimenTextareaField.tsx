import { type Control, Controller } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import { changedControlClassName } from "./changedFieldStyles";

type SpecimenTextareaFieldProps = {
	control: Control<AddNewSpecimenFormValues>;
	name: "connection_description" | "note";
	label: string;
	rows: number;
	isChanged?: boolean;
};

export function SpecimenTextareaField({
	control,
	name,
	label,
	rows,
	isChanged = false,
}: SpecimenTextareaFieldProps) {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState }) => (
				<Field data-invalid={fieldState.invalid}>
					<FieldLabel htmlFor={name}>{label}</FieldLabel>
					<Textarea
						{...field}
						id={name}
						value={field.value ?? ""}
						aria-invalid={fieldState.invalid}
						rows={rows}
						className={cn(isChanged && changedControlClassName)}
					/>
					{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
				</Field>
			)}
		/>
	);
}
