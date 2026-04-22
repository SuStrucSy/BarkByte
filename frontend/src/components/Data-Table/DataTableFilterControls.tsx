import { DataTableFilterCheckbox } from "@/components/Data-Table/DataTableFilterCheckbox";
import { DataTableFilterResetButton } from "@/components/Data-Table/DataTableFilterResetButton";
import { DataTableFilterSlider } from "@/components/Data-Table/DataTableFilterSlider";
import type { FailureModeFilterMode } from "@/components/Data-Table/specimenTableFilters";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

export interface DataTableCheckboxFilterField {
	type: "checkbox";
	value: string;
	label: string;
	options: string[];
}

export interface DataTableSliderFilterField {
	type: "slider";
	value: string;
	label: string;
	min: number;
	max: number;
	step?: number;
}

export type DataTableFilterField =
	| DataTableCheckboxFilterField
	| DataTableSliderFilterField;

interface DataTableFilterControlsProps {
	fields: DataTableFilterField[];
	openByField: Record<string, boolean>;
	selectedByField: Record<string, string[]>;
	sliderValuesByField: Record<string, [number, number]>;
	failureModeFilterMode: FailureModeFilterMode;
	onFieldOpenChange: (field: string, open: boolean) => void;
	onToggleOption: (field: string, option: string) => void;
	onSliderChange: (field: string, value: [number, number]) => void;
	onFailureModeFilterModeChange: (mode: FailureModeFilterMode) => void;
	onResetField: (field: string) => void;
}

export function DataTableFilterControls({
	fields,
	openByField,
	selectedByField,
	sliderValuesByField,
	failureModeFilterMode,
	onFieldOpenChange,
	onToggleOption,
	onSliderChange,
	onFailureModeFilterModeChange,
	onResetField,
}: DataTableFilterControlsProps) {
	const openValues = fields
		.filter((field) => openByField[field.value])
		.map((field) => field.value);

	return (
		<div className="min-w-0 bg-muted">
			<Accordion
				type="multiple"
				value={openValues}
				onValueChange={(values) => {
					const nextOpenSet = new Set(values);
					for (const field of fields) {
						onFieldOpenChange(field.value, nextOpenSet.has(field.value));
					}
				}}
			>
				{fields.map((field) => (
					<AccordionItem
						key={field.value}
						value={field.value}
						className="min-w-0 border-border bg-muted data-[state=open]:bg-background"
					>
						<AccordionTrigger className="h-12 px-4 py-0 font-normal no-underline transition-colors hover:bg-background hover:no-underline data-[state=open]:hover:bg-transparent">
							<div className="flex min-w-0 flex-1 items-center justify-between gap-2 pr-2">
								<p className="truncate text-sm font-medium text-foreground/80">
									{field.label}
								</p>
								<div className="shrink-0">
									<DataTableFilterResetButton
										field={field.value}
										count={
											field.type === "checkbox"
												? (selectedByField[field.value]?.length ?? 0)
												: sliderValuesByField[field.value] &&
														(sliderValuesByField[field.value][0] !== field.min ||
															sliderValuesByField[field.value][1] !== field.max)
													? 1
													: 0
										}
										onReset={onResetField}
									/>
								</div>
							</div>
						</AccordionTrigger>
						<AccordionContent className="min-w-0 px-4 pb-3 pt-1">
							{field.type === "checkbox" ? (
								<DataTableFilterCheckbox
									field={field.value}
									options={field.options}
									selected={selectedByField[field.value] ?? []}
									failureModeFilterMode={
										field.value === "failure_modes"
											? failureModeFilterMode
											: undefined
									}
									onToggle={onToggleOption}
									onFailureModeFilterModeChange={
										field.value === "failure_modes"
											? onFailureModeFilterModeChange
											: undefined
									}
								/>
							) : (
								<DataTableFilterSlider
									field={field.value}
									min={field.min}
									max={field.max}
									step={field.step}
									value={
										sliderValuesByField[field.value] ?? [field.min, field.max]
									}
									onChange={onSliderChange}
								/>
							)}
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
		</div>
	);
}
