import {
  DataTableFilterControls,
  type DataTableFilterField,
} from "@/components/Data-Table/DataTableFilterControls";
import { Button } from "@/components/ui/button";
import { useState } from "react";

/**
 * Sidebar container for specimens filters.
 * It renders filter controls, "expand/collapse all", and "clear all" actions,
 * while keeping only UI-local accordion state inside this component.
 */
interface SpecimenTableSideBarProps {
  controlsOpen: boolean;
  panelHeightClassName: string;
  onClearAll: () => void;
  hasActiveSidebarFilters: boolean;
  fields: DataTableFilterField[];
  selectedByField: Record<string, string[]>;
  sliderValuesByField: Record<string, [number, number]>;
  onToggleOption: (field: string, option: string) => void;
  onSliderChange: (field: string, value: [number, number]) => void;
  onResetField: (field: string) => void;
}

/**
 * Displays the filter panel next to the specimens table.
 * Parent provides filter data/state; this component manages only bulk open/close UI behavior.
 */
export function SpecimenTableSideBar({
  controlsOpen,
  panelHeightClassName,
  onClearAll,
  hasActiveSidebarFilters,
  fields,
  selectedByField,
  sliderValuesByField,
  onToggleOption,
  onSliderChange,
  onResetField,
}: SpecimenTableSideBarProps) {
  // Signals DataTableFilterControls to apply a bulk open/close action once.
  const [toggleAllSignal, setToggleAllSignal] = useState(0);
  // Desired open state when the bulk toggle signal fires.
  const [toggleAllOpenState, setToggleAllOpenState] = useState(false);
  // Tracks current aggregate collapse state to choose button label/action.
  const [allControlsCollapsed, setAllControlsCollapsed] = useState(false);

  // Flip all filter sections at once by toggling both desired state and signal id.
  const handleToggleAll = () => {
    const nextCollapsedState = !allControlsCollapsed;
    setToggleAllOpenState(!nextCollapsedState);
    setToggleAllSignal((prev) => prev + 1);
  };

  return (
    <aside
      className={`w-full min-h-0 overflow-hidden rounded-md border sm:w-72 sm:min-w-72 sm:max-w-72 md:w-80 md:min-w-80 md:max-w-80 ${panelHeightClassName} ${
        controlsOpen ? "block" : "hidden"
      }`}
    >
      {/* Sticky header keeps global filter actions visible while sidebar content scrolls. */}
      <div className="sticky top-0 z-10 border-b bg-background p-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-medium">Filters</h3>
          <div className="flex shrink-0 items-center gap-1 whitespace-nowrap">
            {/* Toggles every filter subsection open/closed in one click. */}
            <Button variant="secondary" size="sm" onClick={handleToggleAll}>
              {allControlsCollapsed ? "Expand all" : "Collapse all"}
            </Button>

            {/* Clears all active sidebar filters and resets sliders back to defaults. */}
            {hasActiveSidebarFilters ? (
              <Button variant="secondary" size="sm" onClick={onClearAll}>
                Clear
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      {/* Scrollable body that renders all checkbox + slider filter controls. */}
      <div className="h-[calc(100%-57px)] overflow-auto p-3">
        <DataTableFilterControls
          fields={fields}
          selectedByField={selectedByField}
          sliderValuesByField={sliderValuesByField}
          onToggleOption={onToggleOption}
          onSliderChange={onSliderChange}
          onResetField={onResetField}
          toggleAllSignal={toggleAllSignal}
          toggleAllOpenState={toggleAllOpenState}
          onAllCollapsedChange={setAllControlsCollapsed}
        />
      </div>
    </aside>
  );
}
