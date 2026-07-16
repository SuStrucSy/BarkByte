import {
	type ForceDisplacementBackboneChartDatum,
	formatTooltipValue,
	splitAxisLabel,
} from "./forceDisplacementBackboneChart.utils";

type ForceDisplacementTooltipContentProps = {
	datum: ForceDisplacementBackboneChartDatum;
	xAxisLabel: string;
	yAxisLabel: string;
};

export function ForceDisplacementTooltipContent({
	datum,
	xAxisLabel,
	yAxisLabel,
}: ForceDisplacementTooltipContentProps) {
	const xAxisInfo = splitAxisLabel(xAxisLabel);
	const yAxisInfo = splitAxisLabel(yAxisLabel);

	return (
		<div className="border-border/50 bg-background grid min-w-48 gap-2 rounded-lg border px-3 py-2 text-xs shadow-xl">
			<p className="font-medium text-foreground">{datum.label}</p>
			<div className="flex items-stretch gap-2">
				<span
					className="w-1 shrink-0 rounded-full"
					style={{
						backgroundColor: "var(--color-backbone)",
					}}
				/>
				<div className="grid flex-1 gap-1.5">
					<div className="flex items-center justify-between gap-3">
						<span className="text-muted-foreground">{xAxisInfo.name}</span>
						<span className="font-mono font-medium tabular-nums text-foreground">
							{formatTooltipValue(datum.x, xAxisInfo.unit)}
						</span>
					</div>
					<div className="flex items-center justify-between gap-3">
						<span className="text-muted-foreground">{yAxisInfo.name}</span>
						<span className="font-mono font-medium tabular-nums text-foreground">
							{formatTooltipValue(datum.y, yAxisInfo.unit)}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
