import { type Control, Controller } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";

type SpecimenReferenceIdFieldProps = {
	control: Control<AddNewSpecimenFormValues>;
	isChanged?: boolean;
};

const changedControlClassName =
	"border-emerald-500 text-emerald-700 focus-visible:border-emerald-600 focus-visible:ring-emerald-200/50 dark:border-emerald-700 dark:text-emerald-400";

export function SpecimenReferenceIdField({
	control,
	isChanged = false,
}: SpecimenReferenceIdFieldProps) {
	return (
		<Controller
			name="specimen_reference_id"
			control={control}
			render={({ field, fieldState }) => (
				<Field data-invalid={fieldState.invalid}>
					<FieldLabel htmlFor="specimen_reference_id">Reference ID</FieldLabel>
					<Input
						{...field}
						id="specimen_reference_id"
						aria-invalid={fieldState.invalid}
						autoComplete="off"
						className={cn("w-full", isChanged && changedControlClassName)}
					/>
					{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
				</Field>
			)}
		/>
	);
}
