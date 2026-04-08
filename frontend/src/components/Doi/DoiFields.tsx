import { type Control, Controller } from "react-hook-form";

import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";
import { Input } from "../ui/input";

interface DoiFieldsProps {
	control: Control<AddNewSpecimenFormValues>;
	/** When true, all inputs are disabled (user selected an existing DOI). */
	readOnly?: boolean;
}

export function DoiFields({ control, readOnly = false }: DoiFieldsProps) {
	return (
		<FieldGroup>
			<Controller
				name="link"
				control={control}
				render={({ field, fieldState }) => (
					<Field data-invalid={fieldState.invalid}>
						<FieldLabel htmlFor="link">DOI Link</FieldLabel>
						<Input
							{...field}
							id="link"
							aria-invalid={fieldState.invalid}
							autoComplete="off"
							type="url"
							disabled={readOnly}
						/>
						{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
					</Field>
				)}
			/>
			<Controller
				name="ref_title"
				control={control}
				render={({ field, fieldState }) => (
					<Field data-invalid={fieldState.invalid}>
						<FieldLabel htmlFor="ref_title">Reference Title</FieldLabel>
						<Input
							{...field}
							id="ref_title"
							aria-invalid={fieldState.invalid}
							autoComplete="off"
							disabled={readOnly}
						/>
						{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
					</Field>
				)}
			/>
			<Controller
				name="authors"
				control={control}
				render={({ field, fieldState }) => (
					<Field data-invalid={fieldState.invalid}>
						<FieldLabel htmlFor="authors">Authors</FieldLabel>
						<Input
							{...field}
							id="authors"
							aria-invalid={fieldState.invalid}
							autoComplete="off"
							disabled={readOnly}
						/>
						{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
					</Field>
				)}
			/>
			<Controller
				name="pub_year"
				control={control}
				render={({ field, fieldState }) => (
					<Field data-invalid={fieldState.invalid}>
						<FieldLabel htmlFor="pub_year">Publication Year</FieldLabel>
						<Input
							id="pub_year"
							name={field.name}
							ref={field.ref}
							onBlur={field.onBlur}
							value={field.value ?? ""}
							onChange={(e) => field.onChange(e.target.valueAsNumber)}
							aria-invalid={fieldState.invalid}
							autoComplete="off"
							type="number"
							disabled={readOnly}
						/>
						{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
					</Field>
				)}
			/>
		</FieldGroup>
	);
}
