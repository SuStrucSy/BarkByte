import { type Control, Controller } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { changedControlClassName } from "./changedFieldStyles";

type SpecimenNumberFieldProps = {
	control: Control<AddNewSpecimenFormValues>;
	name: "fastener_numbers" | "replicate_tests";
	label: string;
	min?: number;
	step?: number;
	isChanged?: boolean;
};

export function SpecimenNumberField({
	control,
	name,
	label,
	min = 1,
	step = 1,
	isChanged = false,
}: SpecimenNumberFieldProps) {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState }) => (
				<Field data-invalid={fieldState.invalid}>
					<FieldLabel htmlFor={name}>{label}</FieldLabel>
					<Input
						id={name}
						name={field.name}
						ref={field.ref}
						onBlur={field.onBlur}
						type="number"
						min={min}
						step={step}
						value={field.value ?? ""}
						onChange={(e) => field.onChange(e.target.valueAsNumber)}
						aria-invalid={fieldState.invalid}
						className={cn("w-full", isChanged && changedControlClassName)}
					/>
					{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
				</Field>
			)}
		/>
	);
}
