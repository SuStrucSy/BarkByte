import { useMemo } from "react";
import { type Control, Controller } from "react-hook-form";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import {
	Combobox,
	ComboboxChip,
	ComboboxChips,
	ComboboxChipsInput,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxItem,
	ComboboxList,
	ComboboxValue,
	useComboboxAnchor,
} from "../ui/combobox";
import { changedControlClassName } from "./changedFieldStyles";

type ComboboxOption = {
	id: string;
	label: string;
};

type SpecimenMultiComboboxFieldProps<TOption extends ComboboxOption> = {
	control: Control<AddNewSpecimenFormValues>;
	name: "fastener_type_ids" | "loading_direction_ids";
	label: string;
	description: string;
	emptyMessage: string;
	options: TOption[];
	isChanged?: boolean;
};

export function SpecimenMultiComboboxField<TOption extends ComboboxOption>({
	control,
	name,
	label,
	description,
	emptyMessage,
	options,
	isChanged = false,
}: SpecimenMultiComboboxFieldProps<TOption>) {
	const anchor = useComboboxAnchor();
	const labelById = useMemo(
		() => new Map(options.map((option) => [option.id, option.label])),
		[options],
	);

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState }) => {
				const values = Array.isArray(field.value) ? field.value : [];

				return (
					<Field data-invalid={fieldState.invalid}>
						<FieldLabel htmlFor={name}>{label}</FieldLabel>
						<Combobox
							multiple
							items={options}
							onValueChange={(selectedValues) => field.onChange(selectedValues)}
							itemToStringValue={(option) =>
								(option as unknown as ComboboxOption).id
							}
							value={values}
						>
							<ComboboxChips
								ref={anchor}
								className={cn(
									"w-full max-w-xs",
									isChanged && changedControlClassName,
								)}
							>
								<ComboboxValue>
									{(chips) => (
										<>
											{(chips as string[]).map((chipId) => (
												<ComboboxChip key={chipId}>
													{labelById.get(chipId) ?? ""}
												</ComboboxChip>
											))}
											<ComboboxChipsInput />
										</>
									)}
								</ComboboxValue>
							</ComboboxChips>
							<ComboboxContent anchor={anchor}>
								<ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
								<ComboboxList>
									{(option) => (
										<ComboboxItem key={option.id} value={option.id}>
											{option.label}
										</ComboboxItem>
									)}
								</ComboboxList>
							</ComboboxContent>
						</Combobox>
						<FieldDescription>{description}</FieldDescription>
						{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
					</Field>
				);
			}}
		/>
	);
}
