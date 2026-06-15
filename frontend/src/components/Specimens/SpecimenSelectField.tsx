import type { ReactNode } from "react";
import { type Control, Controller } from "react-hook-form";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { changedControlClassName } from "./changedFieldStyles";

type SelectOption = {
	id: string;
	label: string;
};

type SpecimenSelectFieldProps<TOption extends SelectOption> = {
	control: Control<AddNewSpecimenFormValues>;
	name: "joinery_type_id" | "sub_joinery_type_id";
	label: string;
	placeholder: string;
	options: TOption[];
	description?: ReactNode;
	labelAddon?: ReactNode;
	isChanged?: boolean;
	contentPosition?: "item-aligned" | "popper";
};

export function SpecimenSelectField<TOption extends SelectOption>({
	control,
	name,
	label,
	placeholder,
	options,
	description,
	labelAddon,
	isChanged = false,
	contentPosition,
}: SpecimenSelectFieldProps<TOption>) {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState }) => (
				<Field data-invalid={fieldState.invalid}>
					<FieldLabel htmlFor={name}>
						{label}
						{labelAddon}
					</FieldLabel>
					<Select
						name={field.name}
						value={field.value ?? ""}
						onValueChange={field.onChange}
					>
						<SelectTrigger
							id={name}
							aria-invalid={fieldState.invalid}
							className={cn("w-full", isChanged && changedControlClassName)}
						>
							<SelectValue placeholder={placeholder} />
						</SelectTrigger>
						<SelectContent position={contentPosition}>
							{options.map((option) => (
								<SelectItem key={option.id} value={option.id}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{description && <FieldDescription>{description}</FieldDescription>}
					{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
				</Field>
			)}
		/>
	);
}
