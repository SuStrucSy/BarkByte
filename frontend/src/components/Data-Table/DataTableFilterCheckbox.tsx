import { Checkbox } from "@/components/ui/checkbox";
import { canonicalizeFilterValue } from "@/components/Data-Table/specimenTableFilters";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";

interface DataTableFilterCheckboxProps {
  field: string;
  options: string[];
  selected: string[];
  onToggle: (field: string, option: string) => void;
}

export function DataTableFilterCheckbox({
  field,
  options,
  selected,
  onToggle,
}: DataTableFilterCheckboxProps) {
  const [query, setQuery] = useState("");
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
