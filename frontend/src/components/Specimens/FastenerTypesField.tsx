import { useMemo } from "react";
import { type Control, Controller } from "react-hook-form";
import type { FastenerType } from "@/api/model";
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

type FastenerTypeOption = FastenerType & { id: string };

type FastenerTypesFieldProps = {
	control: Control<AddNewSpecimenFormValues>;
	fastenerTypeList: FastenerTypeOption[];
	isChanged?: boolean;
};

const changedControlClassName =
	"border-emerald-500 text-emerald-700 focus-visible:border-emerald-600 focus-visible:ring-emerald-200/50 dark:border-emerald-700 dark:text-emerald-400";

export function FastenerTypesField({
	control,
	fastenerTypeList,
	isChanged = false,
}: FastenerTypesFieldProps) {
	const anchorFastener = useComboboxAnchor();
	const fastenerLabelById = useMemo(
		() =>
			new Map(
				fastenerTypeList.map((fastener) => [fastener.id, fastener.label]),
			),
		[fastenerTypeList],
	);

	return (
		<Controller
			name="fastener_type_ids"
			control={control}
			render={({ field, fieldState }) => {
				const values = Array.isArray(field.value) ? field.value : [];

				return (
					<Field data-invalid={fieldState.invalid}>
						<FieldLabel htmlFor="fastener_type_ids">Fastener Types</FieldLabel>
						<Combobox
							multiple
							items={fastenerTypeList}
							onValueChange={(selectedValues) => field.onChange(selectedValues)}
							itemToStringValue={(fastener) =>
								(fastener as unknown as FastenerTypeOption).id
							}
							value={values}
						>
							<ComboboxChips
								ref={anchorFastener}
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
													{fastenerLabelById.get(chipId) ?? ""}
												</ComboboxChip>
											))}
											<ComboboxChipsInput />
										</>
									)}
								</ComboboxValue>
							</ComboboxChips>
							<ComboboxContent anchor={anchorFastener}>
								<ComboboxEmpty>No fastener types found.</ComboboxEmpty>
								<ComboboxList>
									{(fastener) => (
										<ComboboxItem key={fastener.id} value={fastener.id}>
											{fastener.label}
										</ComboboxItem>
									)}
								</ComboboxList>
							</ComboboxContent>
						</Combobox>
						<FieldDescription>
							Select one or more fastener types
						</FieldDescription>
						{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
					</Field>
				);
			}}
		/>
	);
}
