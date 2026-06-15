import { useMemo } from "react";
import { type Control, Controller } from "react-hook-form";
import type { LoadingDirection } from "@/api/model";
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

type LoadingDirectionOption = LoadingDirection & { id: string };

type LoadingDirectionsFieldProps = {
	control: Control<AddNewSpecimenFormValues>;
	loadingDirectionList: LoadingDirectionOption[];
	isChanged?: boolean;
};

const changedControlClassName =
	"border-emerald-500 text-emerald-700 focus-visible:border-emerald-600 focus-visible:ring-emerald-200/50 dark:border-emerald-700 dark:text-emerald-400";

export function LoadingDirectionsField({
	control,
	loadingDirectionList,
	isChanged = false,
}: LoadingDirectionsFieldProps) {
	const anchorLoading = useComboboxAnchor();
	const loadingDirectionLabelById = useMemo(
		() =>
			new Map(
				loadingDirectionList.map((loading) => [loading.id, loading.label]),
			),
		[loadingDirectionList],
	);

	return (
		<Controller
			name="loading_direction_ids"
			control={control}
			render={({ field, fieldState }) => {
				const values = Array.isArray(field.value) ? field.value : [];

				return (
					<Field data-invalid={fieldState.invalid}>
						<FieldLabel htmlFor="loading_direction_ids">
							Loading Direction
						</FieldLabel>
						<Combobox
							multiple
							items={loadingDirectionList}
							onValueChange={(selectedValues) => field.onChange(selectedValues)}
							itemToStringValue={(loading) =>
								(loading as unknown as LoadingDirectionOption).id
							}
							value={values}
						>
							<ComboboxChips
								ref={anchorLoading}
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
													{loadingDirectionLabelById.get(chipId) ?? ""}
												</ComboboxChip>
											))}
											<ComboboxChipsInput />
										</>
									)}
								</ComboboxValue>
							</ComboboxChips>
							<ComboboxContent anchor={anchorLoading}>
								<ComboboxEmpty>No loading direction found.</ComboboxEmpty>
								<ComboboxList>
									{(loading) => (
										<ComboboxItem key={loading.id} value={loading.id}>
											{loading.label}
										</ComboboxItem>
									)}
								</ComboboxList>
							</ComboboxContent>
						</Combobox>
						<FieldDescription>
							Select one or more loading directions
						</FieldDescription>
						{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
					</Field>
				);
			}}
		/>
	);
}
