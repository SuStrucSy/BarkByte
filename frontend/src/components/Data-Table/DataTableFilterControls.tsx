import { ChevronDown } from "lucide-react";
import { DataTableFilterCheckbox } from "@/components/Data-Table/DataTableFilterCheckbox";
import { DataTableFilterResetButton } from "@/components/Data-Table/DataTableFilterResetButton";
import { DataTableFilterSlider } from "@/components/Data-Table/DataTableFilterSlider";
import type { FailureModeFilterMode } from "@/components/Data-Table/specimenTableFilters";

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
	return (
		<div className="min-w-0 bg-background">
			{fields.map((field) => (
				<details
					key={field.value}
					className="min-w-0 border-b border-border bg-background last:border-b-0"
					open={openByField[field.value] ?? false}
					onToggle={(event) => {
						const isOpen = (event.currentTarget as HTMLDetailsElement).open;
						onFieldOpenChange(field.value, isOpen);
					}}
				>
					<summary className="flex min-h-12 min-w-0 cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 transition-colors hover:bg-muted">
						<div className="flex min-w-0 items-center gap-2">
							<ChevronDown
								className={`h-4 w-4 text-muted-foreground transition-transform ${
									openByField[field.value] ? "rotate-180" : ""
								}`}
							/>
							<p className="truncate text-sm font-medium text-foreground/80">
								{field.label}
							</p>
						</div>
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
					</summary>
					<div className="min-w-0 px-4 pb-3 pt-1">
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
					</div>
				</details>
			))}
		</div>
	);
}
