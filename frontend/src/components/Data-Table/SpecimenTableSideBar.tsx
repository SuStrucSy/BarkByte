import { useMemo, useState } from "react";
import {
	DataTableFilterControls,
	type DataTableFilterField,
} from "@/components/Data-Table/DataTableFilterControls";
import type { FailureModeFilterMode } from "@/components/Data-Table/specimenTableFilters";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

/**
 * Sidebar container for specimens filters.
 * It renders filter controls, "expand/collapse all", and "clear all" actions,
 * while keeping only UI-local accordion state inside this component.
 */
interface SpecimenTableSideBarProps {
	className?: string;
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
	className,
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
		<aside
			className={cn(
				"flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-md border border-gray-200 bg-muted",
				className,
			)}
		>
			{/* Sticky header keeps global filter actions visible while sidebar content scrolls. */}
			<div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b bg-muted p-3">
				<h3 className="text-sm font-medium">Filters</h3>
				<div className="flex shrink-0 items-center gap-1 whitespace-nowrap">
					{/* Toggles every filter subsection open/closed in one click. */}
					<Button
						variant="ghost"
						size="sm"
						className="hover:bg-background active:bg-background"
						onClick={handleToggleAll}
					>
						{allControlsCollapsed ? "Expand all" : "Collapse all"}
					</Button>

					{hasActiveSidebarFilters ? (
						<Button
							variant="ghost"
							size="sm"
							className="hover:bg-background active:bg-background"
							onClick={onClearAll}
						>
							Clear
						</Button>
					) : null}
				</div>
			</div>
			{/* Scrollable body that renders all checkbox + slider filter controls. */}
			<ScrollArea className="min-h-0 flex-1 bg-muted">
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
