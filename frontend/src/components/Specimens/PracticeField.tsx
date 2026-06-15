import { type Control, Controller } from "react-hook-form";
import {
	Field,
	FieldError,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";
import { cn } from "@/lib/utils";

const PRACTICE_OPTIONS = ["Conventional", "Research and Development"] as const;

type PracticeFieldProps = {
	control: Control<AddNewSpecimenFormValues>;
	isChanged?: boolean;
};

const changedControlClassName =
	"border-emerald-500 text-emerald-700 focus-visible:border-emerald-600 focus-visible:ring-emerald-200/50 dark:border-emerald-700 dark:text-emerald-400";

export function PracticeField({
	control,
	isChanged = false,
}: PracticeFieldProps) {
	return (
		<Controller
			name="practice"
			control={control}
			render={({ field, fieldState }) => (
				<FieldSet data-invalid={fieldState.invalid}>
					<FieldLegend>Practice</FieldLegend>
					<RadioGroup
						name={field.name}
						value={field.value ?? ""}
						onValueChange={field.onChange}
						aria-invalid={fieldState.invalid}
					>
						{PRACTICE_OPTIONS.map((practice) => (
							<Field
								key={practice}
								orientation="horizontal"
								data-invalid={fieldState.invalid}
							>
								<RadioGroupItem
									value={practice}
									id={practice}
									aria-invalid={fieldState.invalid}
									className={cn(isChanged && changedControlClassName)}
								/>
								<FieldLabel htmlFor={practice}>{practice}</FieldLabel>
							</Field>
						))}
					</RadioGroup>
					{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
				</FieldSet>
			)}
		/>
	);
}
