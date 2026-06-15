import { type Control, Controller } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { changedControlClassName } from "./changedFieldStyles";

type SpecimenTextFieldProps = {
	control: Control<AddNewSpecimenFormValues>;
	name: "specimen_reference_id";
	label: string;
	autoComplete?: string;
	isChanged?: boolean;
};

export function SpecimenTextField({
	control,
	name,
	label,
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
						aria-invalid={fieldState.invalid}
						autoComplete={autoComplete}
						className={cn("w-full", isChanged && changedControlClassName)}
					/>
					{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
				</Field>
			)}
		/>
	);
}
