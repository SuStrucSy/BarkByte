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

type SpecimenNumberFieldName =
	| "fastener_numbers"
	| "replicate_tests"
	| "e_stiffness"
	| "e_ductility"
	| "e_yield_force"
	| "e_yield_displacement"
	| "e_max_force"
	| "e_max_displacement"
	| "e_ultimate_force"
	| "e_ultimate_displacement";

type SpecimenNumberFieldProps = {
	control: Control<AddNewSpecimenFormValues>;
	name: SpecimenNumberFieldName;
	label: string;
	description?: string;
	unit?: string;
	min?: number;
	step?: number | "any";
	emptyValue?: "nan" | "null";
	className?: string;
	isChanged?: boolean;
};

export function SpecimenNumberField({
	control,
	name,
	label,
	description,
	unit,
	min = 1,
	step = 1,
	emptyValue = "nan",
	className = "w-full",
	isChanged = false,
}: SpecimenNumberFieldProps) {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState }) => (
				<Field data-invalid={fieldState.invalid}>
					<FieldLabel htmlFor={name}>
						{label}
						{unit && (
							<span className="text-muted-foreground font-normal ml-1">
								({unit})
							</span>
						)}
					</FieldLabel>
					<Input
						id={name}
						name={field.name}
						ref={field.ref}
						onBlur={field.onBlur}
						type="number"
						min={min}
						step={step}
						value={typeof field.value === "number" ? field.value : ""}
						onChange={(e) =>
							field.onChange(
								e.target.value === "" && emptyValue === "null"
									? null
									: e.target.valueAsNumber,
							)
						}
						aria-invalid={fieldState.invalid}
						className={cn(className, isChanged && changedControlClassName)}
					/>
					{description && <FieldDescription>{description}</FieldDescription>}
					{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
				</Field>
			)}
		/>
	);
}
