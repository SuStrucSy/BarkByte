import { useMemo, useState } from "react";
import {
	DataTableFilterControls,
	type DataTableFilterField,
} from "@/components/Data-Table/DataTableFilterControls";
import type { FailureModeFilterMode } from "@/components/Data-Table/specimenTableFilters";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * Sidebar container for specimens filters.
 * It renders filter controls, "expand/collapse all", and "clear all" actions,
 * while keeping only UI-local accordion state inside this component.
 */
interface SpecimenTableSideBarProps {
	onClearAll: () => void;
	hasActiveSidebarFilters: boolean;
	fields: DataTableFilterField[];
	selectedByField: Record<string, string[]>;
	sliderValuesByField: Record<string, [number, number]>;
	failureModeFilterMode: FailureModeFilterMode;
	onToggleOption: (field: string, option: string) => void;
	onSliderChange: (field: string, value: [number, number]) => void;
	onFailureModeFilterModeChange: (mode: FailureModeFilterMode) => void;
	onResetField: (field: string) => void;
}

/**
 * Displays the filter panel next to the specimens table.
 * Parent provides filter data/state; this component owns only the sidebar section UI state.
 */
export function SpecimenTableSideBar({
	onClearAll,
	hasActiveSidebarFilters,
	fields,
	selectedByField,
	sliderValuesByField,
	failureModeFilterMode,
	onToggleOption,
	onSliderChange,
	onFailureModeFilterModeChange,
	onResetField,
}: SpecimenTableSideBarProps) {
	const [openByField, setOpenByField] = useState<Record<string, boolean>>({});

	const allControlsCollapsed = useMemo(
		() =>
			fields.length > 0 && fields.every((field) => !openByField[field.value]),
		[fields, openByField],
	);

	const handleToggleAll = () => {
		const nextOpenState = allControlsCollapsed;
		setOpenByField(
			fields.reduce<Record<string, boolean>>((acc, field) => {
				acc[field.value] = nextOpenState;
				return acc;
			}, {}),
		);
	};

	return (
		<aside className="h-full min-h-0 w-full min-w-0 overflow-hidden rounded-md border border-gray-200">
			{/* Sticky header keeps global filter actions visible while sidebar content scrolls. */}
			<div className="sticky top-0 z-10 border-b bg-background p-3">
				<div className="flex items-center justify-between gap-2">
					<h3 className="text-sm font-medium">Filters</h3>
					<div className="flex shrink-0 items-center gap-1 whitespace-nowrap">
						{/* Toggles every filter subsection open/closed in one click. */}
						<Button variant="ghost" size="sm" onClick={handleToggleAll}>
							{allControlsCollapsed ? "Expand all" : "Collapse all"}
						</Button>

						{hasActiveSidebarFilters ? (
							<Button variant="ghost" size="sm" onClick={onClearAll}>
								Clear
							</Button>
						) : null}
					</div>
				</div>
			</div>
			{/* Scrollable body that renders all checkbox + slider filter controls. */}
			<ScrollArea>

				<DataTableFilterControls
					fields={fields}
					openByField={openByField}
					selectedByField={selectedByField}
					sliderValuesByField={sliderValuesByField}
					failureModeFilterMode={failureModeFilterMode}
					onFieldOpenChange={(field, open) =>
						setOpenByField((prev) => ({ ...prev, [field]: open }))
					}
					onToggleOption={onToggleOption}
					onSliderChange={onSliderChange}
					onFailureModeFilterModeChange={onFailureModeFilterModeChange}
					onResetField={onResetField}
				/>
	
			</ScrollArea>
		</aside>
	);
}
