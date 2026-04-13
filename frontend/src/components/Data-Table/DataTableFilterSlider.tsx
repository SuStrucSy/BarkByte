import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
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
	const decimalPlaces = useMemo(() => {
		const stepString = step.toString();
		return stepString.includes(".") ? stepString.split(".")[1].length : 0;
	}, [step]);

	const formatValue = useCallback(
		(nextValue: number) => nextValue.toFixed(decimalPlaces),
		[decimalPlaces],
	);

	const [draftMin, setDraftMin] = useState(() => formatValue(value[0]));
	const [draftMax, setDraftMax] = useState(() => formatValue(value[1]));

	useEffect(() => {
		setDraftMin(formatValue(value[0]));
		setDraftMax(formatValue(value[1]));
	}, [formatValue, value]);

	const clampValue = (nextValue: number) =>
		Math.min(max, Math.max(min, nextValue));

	const commitValue = (edge: "min" | "max", nextDraft: string) => {
		if (nextDraft.trim() === "") {
			setDraftMin(formatValue(value[0]));
			setDraftMax(formatValue(value[1]));
			return;
		}

		const parsedValue = Number(nextDraft);
		if (Number.isNaN(parsedValue)) {
			setDraftMin(formatValue(value[0]));
			setDraftMax(formatValue(value[1]));
			return;
		}

		const clampedValue = clampValue(parsedValue);
		const nextRange: [number, number] =
			edge === "min"
				? [Math.min(clampedValue, value[1]), value[1]]
				: [value[0], Math.max(clampedValue, value[0])];

		onChange(field, nextRange);
	};

	return (
		<div className="space-y-2">
			<div className="grid grid-cols-2 gap-2">
				<Input
					type="number"
					inputMode="decimal"
					step={step}
					min={min}
					max={max}
					value={draftMin}
					onChange={(event) => setDraftMin(event.target.value)}
					onBlur={(event) => commitValue("min", event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							commitValue("min", event.currentTarget.value);
							event.currentTarget.blur();
						}
					}}
					aria-label={`${field} minimum value`}
					className="h-8 text-xs"
				/>
				<Input
					type="number"
					inputMode="decimal"
					step={step}
					min={min}
					max={max}
					value={draftMax}
					onChange={(event) => setDraftMax(event.target.value)}
					onBlur={(event) => commitValue("max", event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							commitValue("max", event.currentTarget.value);
							event.currentTarget.blur();
						}
					}}
					aria-label={`${field} maximum value`}
					className="h-8 text-xs"
				/>
			</div>
			<Slider
				min={min}
				max={max}
				step={step}
				value={value}
				onValueChange={(next) => onChange(field, [next[0], next[1]])}
			/>
		</div>
	);
}
