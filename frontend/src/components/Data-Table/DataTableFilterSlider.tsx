import { Slider } from "@/components/ui/slider";

interface DataTableFilterSliderProps {
  field: string;
  min: number;
  max: number;
  value: [number, number];
  step?: number;
  onChange: (field: string, value: [number, number]) => void;
}

export function DataTableFilterSlider({
  field,
  min,
  max,
  value,
  step = 1,
  onChange,
}: DataTableFilterSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{value[0].toLocaleString()}</span>
        <span>{value[1].toLocaleString()}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={(next) => onChange(field, [next[0], next[1]])}
      />
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Min: {min.toLocaleString()}</span>
        <span>Max: {max.toLocaleString()}</span>
      </div>
    </div>
  );
}
