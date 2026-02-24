import { DataTableFilterCheckbox } from "@/components/Data-Table/DataTableFilterCheckbox";
import { DataTableFilterResetButton } from "@/components/Data-Table/DataTableFilterResetButton";
import { DataTableFilterSlider } from "@/components/Data-Table/DataTableFilterSlider";
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
  selectedByField: Record<string, string[]>;
  sliderValuesByField: Record<string, [number, number]>;
  onToggleOption: (field: string, option: string) => void;
  onSliderChange: (field: string, value: [number, number]) => void;
  onResetField: (field: string) => void;
  toggleAllSignal?: number;
  toggleAllOpenState?: boolean;
  onAllCollapsedChange?: (collapsed: boolean) => void;
}

export function DataTableFilterControls({
  fields,
  selectedByField,
  sliderValuesByField,
  onToggleOption,
  onSliderChange,
  onResetField,
  toggleAllSignal,
  toggleAllOpenState,
  onAllCollapsedChange,
}: DataTableFilterControlsProps) {
  const initialOpenState = useMemo(
    () =>
      fields.reduce<Record<string, boolean>>((acc, field, index) => {
        acc[field.value] = index < 2;
        return acc;
      }, {}),
    [fields],
  );
  const [openByField, setOpenByField] = useState<Record<string, boolean>>(
    initialOpenState,
  );
  useEffect(() => {
    setOpenByField((prev) => {
      const next = { ...prev };
      fields.forEach((field, index) => {
        if (typeof next[field.value] === "undefined") {
          next[field.value] = index < 2;
        }
      });
      return next;
    });
  }, [fields]);

  useEffect(() => {
    if (
      typeof toggleAllSignal === "undefined" ||
      typeof toggleAllOpenState === "undefined"
    ) {
      return;
    }
    setOpenByField((prev) => {
      const next = { ...prev };
      fields.forEach((field) => {
        next[field.value] = toggleAllOpenState;
      });
      return next;
    });
  }, [toggleAllSignal, toggleAllOpenState, fields]);

  useEffect(() => {
    if (!onAllCollapsedChange) return;
    const collapsed =
      fields.length > 0 && fields.every((field) => !openByField[field.value]);
    onAllCollapsedChange(collapsed);
  }, [openByField, fields, onAllCollapsedChange]);

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <details
          key={field.value}
          className="rounded-md border"
          open={openByField[field.value] ?? false}
          onToggle={(event) => {
            const isOpen = (event.currentTarget as HTMLDetailsElement).open;
            setOpenByField((prev) => ({ ...prev, [field.value]: isOpen }));
          }}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2">
            <div className="flex items-center gap-2">
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  openByField[field.value] ? "rotate-180" : ""
                }`}
              />
              <p className="text-xs font-medium text-muted-foreground">
                {field.label}
              </p>
            </div>
            <DataTableFilterResetButton
              field={field.value}
              count={
                field.type === "checkbox"
                  ? selectedByField[field.value]?.length ?? 0
                  : sliderValuesByField[field.value] &&
                      (sliderValuesByField[field.value][0] !== field.min ||
                        sliderValuesByField[field.value][1] !== field.max)
                    ? 1
                    : 0
              }
              onReset={onResetField}
            />
          </summary>
          <div className="border-t p-3 pt-2">
            {field.type === "checkbox" ? (
              <DataTableFilterCheckbox
                field={field.value}
                options={field.options}
                selected={selectedByField[field.value] ?? []}
                onToggle={onToggleOption}
              />
            ) : (
              <DataTableFilterSlider
                field={field.value}
                min={field.min}
                max={field.max}
                step={field.step}
                value={sliderValuesByField[field.value] ?? [field.min, field.max]}
                onChange={onSliderChange}
              />
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
