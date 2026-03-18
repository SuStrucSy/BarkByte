import { Checkbox } from "@/components/ui/checkbox";
import {
  canonicalizeFilterValue,
  type FailureModeFilterMode,
} from "@/components/Data-Table/specimenTableFilters";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useMemo, useState } from "react";

interface DataTableFilterCheckboxProps {
  field: string;
  options: string[];
  selected: string[];
  failureModeFilterMode?: FailureModeFilterMode;
  onToggle: (field: string, option: string) => void;
  onFailureModeFilterModeChange?: (mode: FailureModeFilterMode) => void;
}

export function DataTableFilterCheckbox({
  field,
  options,
  selected,
  failureModeFilterMode,
  onToggle,
  onFailureModeFilterModeChange,
}: DataTableFilterCheckboxProps) {
  const [query, setQuery] = useState("");
  const isFailureModeField = field === "failure_modes";
  const filteredOptions = useMemo(
    () =>
      options.filter(
        (option) =>
          query.trim() === "" ||
          option.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [options, query],
  );

  return (
    <div className="space-y-2">
      {options.length > 5 ? (
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search options..."
          className="h-8"
        />
      ) : null}
      {isFailureModeField ? (
        <ToggleGroup
          type="single"
          value={failureModeFilterMode}
          onValueChange={(value) => {
            if (!value) return;
            onFailureModeFilterModeChange?.(value as FailureModeFilterMode);
          }}
          variant="outline"
          size="sm"
          spacing={0}
          className="w-full"
          aria-label="Failure mode matching mode"
        >
          <ToggleGroupItem
            value="any"
            className="h-7 flex-1 justify-center px-2 text-xs"
            aria-label="Match any selected failure mode"
          >
            Any
          </ToggleGroupItem>
          <ToggleGroupItem
            value="all"
            className="h-7 flex-1 justify-center px-2 text-xs"
            aria-label="Match all selected failure modes"
          >
            All
          </ToggleGroupItem>
          <ToggleGroupItem
            value="exact"
            className="h-7 flex-1 justify-center px-2 text-xs"
            aria-label="Match exactly the selected failure modes"
          >
            Exact
          </ToggleGroupItem>
        </ToggleGroup>
      ) : null}
      <div className="space-y-1">
        {filteredOptions.map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={selected.some(
                (selectedOption) =>
                  canonicalizeFilterValue(selectedOption) ===
                  canonicalizeFilterValue(option),
              )}
              onCheckedChange={() => onToggle(field, option)}
            />
            <span className="truncate">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
