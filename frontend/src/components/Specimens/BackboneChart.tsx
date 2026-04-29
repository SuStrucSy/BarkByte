import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import type {
	BackboneChartEmptyModel,
	BackboneChartReadyModel,
} from "./backboneChart.types";

// Renders the specimen backbone chart from a ready chart model.
type BackboneChartProps = {
	model: BackboneChartReadyModel | BackboneChartEmptyModel;
	className?: string;
};

// Internal chart data used only by this renderer.
type BackboneChartDatum = {
	x: number;
	y: number;
	key: string;
	label: string;
	series: "backbone";
};

const chartConfig = {
	backbone: {
		label: "Backbone",
		color: "var(--viz-2)",
	},
} satisfies ChartConfig;

// Splits labels like "Force (kN)" into name + unit for the tooltip.
function splitAxisLabel(axisLabel: string) {
	const match = axisLabel.match(/^(.*?)\s*\((.+)\)$/);
	if (!match) {
		return { name: axisLabel, unit: null as string | null };
	}

	return {
		name: match[1]?.trim() ?? axisLabel,
		unit: match[2]?.trim() ?? null,
	};
}

// Formats numeric values for tooltip display.
function formatTooltipValue(value: number, unit: string | null) {
	const renderedValue = Number.isInteger(value)
		? value.toString()
		: value.toFixed(2);
	return unit ? `${renderedValue} ${unit}` : renderedValue;
}

function formatBadgeValue(symbol: string, value: number, unit: string | null) {
	const renderedValue = Number.isInteger(value)
		? value.toString()
		: value.toFixed(2);
	return unit
		? `${symbol} = ${renderedValue} ${unit}`
		: `${symbol} = ${renderedValue}`;
}

// Finds a rounded axis step like 1, 2, 5, 10, 20, etc.
function getNiceStep(roughStep: number) {
	if (!Number.isFinite(roughStep) || roughStep <= 0) {
		return 1;
	}

	const magnitude = 10 ** Math.floor(Math.log10(roughStep));
	const normalized = roughStep / magnitude;

	if (normalized <= 1) {
		return magnitude;
	}
	if (normalized <= 2) {
		return 2 * magnitude;
	}
	if (normalized <= 5) {
		return 5 * magnitude;
	}
	return 10 * magnitude;
}

// Builds a clean axis max and tick list from the current data range.
function buildAxisScale(maxValue: number, targetIntervals = 4) {
	const safeMax = Math.max(maxValue, 1);
	const niceStep = getNiceStep(safeMax / targetIntervals);
	const niceMax = Math.ceil(safeMax / niceStep) * niceStep;
	const ticks = Array.from(
		{ length: Math.floor(niceMax / niceStep) + 1 },
		(_, index) => index * niceStep,
	);

	return {
		max: niceMax,
		ticks,
	};
}

// Converts backbone segments into the straight line actually shown on the chart.
function buildBackbonePathData(model: BackboneChartReadyModel) {
	if (model.segments.length === 0) {
		return [];
	}

	const displayPoints = model.points.filter(
		(point) => point.showMarker !== false,
	);
	const firstPoint = model.segments[0]?.from;
	if (!firstPoint) {
		return [];
	}

	const resolveLabel = (x: number, y: number, fallbackKey: string) =>
		displayPoints.find((point) => point.x === x && point.y === y)?.label ??
		fallbackKey;

	const path: BackboneChartDatum[] = [
		{
			x: firstPoint.x,
			y: firstPoint.y,
			key: "origin",
			label: resolveLabel(firstPoint.x, firstPoint.y, "origin"),
			series: "backbone",
		},
	];

	for (const segment of model.segments) {
		path.push({
			x: segment.to.x,
			y: segment.to.y,
			key: segment.kind,
			label: resolveLabel(segment.to.x, segment.to.y, segment.kind),
			series: "backbone",
		});
	}

	return path;
}

// Tooltip content for the backbone chart.
function BackboneTooltipContent({
	datum,
	xAxisLabel,
	yAxisLabel,
}: {
	datum: BackboneChartDatum;
	xAxisLabel: string;
	yAxisLabel: string;
}) {
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

export function BackboneChart({ model, className }: BackboneChartProps) {
	if (model.status === "empty") {
		return (
			<div
				className={cn(
					"flex min-h-80 items-center justify-center rounded-md border border-dashed border-border px-4 py-6 text-sm text-muted-foreground",
					className,
				)}
			>
				<div className="space-y-1 text-center">
					<p className="font-medium text-foreground">{model.title}</p>
					<p>{model.reason}</p>
				</div>
			</div>
		);
	}

	const chartData = buildBackbonePathData(model);
	const xScale = buildAxisScale(
		Math.max(...chartData.map((point) => point.x), 1) * 1.05,
	);
	const yScale = buildAxisScale(
		Math.max(...chartData.map((point) => point.y), 1) * 1.1,
	);
	const xAxisInfo = splitAxisLabel(model.metadata.xAxisLabel);
	const yAxisInfo = splitAxisLabel(model.metadata.yAxisLabel);
	const pointByKey = new Map(model.points.map((point) => [point.key, point]));
	const maxPoint = pointByKey.get("peak") ?? pointByKey.get("measured-max");
	const measureBadges = [
		model.metadata.stiffnessLabel,
		model.metadata.ductilityLabel,
		pointByKey.get("yield")
			? formatBadgeValue("Δy", pointByKey.get("yield")?.x || 0, xAxisInfo.unit)
			: undefined,
		pointByKey.get("yield")
			? formatBadgeValue("Fy", pointByKey.get("yield")?.y || 0, yAxisInfo.unit)
			: undefined,
		maxPoint ? formatBadgeValue("Δmax", maxPoint.x, xAxisInfo.unit) : undefined,
		maxPoint ? formatBadgeValue("Fmax", maxPoint.y, yAxisInfo.unit) : undefined,
		pointByKey.get("ultimate")
			? formatBadgeValue(
					"Δu",
					pointByKey.get("ultimate")?.x || 0,
					xAxisInfo.unit,
				)
			: undefined,
		pointByKey.get("ultimate")
			? formatBadgeValue(
					"Fu",
					pointByKey.get("ultimate")?.y || 0,
					yAxisInfo.unit,
				)
			: undefined,
	].filter(Boolean);

	return (
		<div
			className={cn("flex h-full min-h-95 w-full min-w-0 flex-col", className)}
		>
			{measureBadges.length > 0 ? (
				<div className="flex flex-wrap gap-2 pb-3">
					{measureBadges.map((label) => (
						<Badge
							key={label}
							variant="secondary"
							className="bg-muted text-foreground"
						>
							{label}
						</Badge>
					))}
				</div>
			) : null}
			<p className="pt-2 pb-3 text-left text-base font-medium text-foreground">
				Force-Displacement Backbone Curve
			</p>
			<ChartContainer
				config={chartConfig}
				className="h-full min-h-95 w-full min-w-0 max-w-full overflow-visible touch-pan-y"
			>
				<LineChart
					accessibilityLayer
					data={chartData}
					margin={{ top: 20, left: 12, right: 12, bottom: 28 }}
				>
					<CartesianGrid vertical={false} />
					<XAxis
						type="number"
						dataKey="x"
						domain={[0, xScale.max]}
						ticks={xScale.ticks}
						tickLine={false}
						axisLine={false}
						tickMargin={8}
						label={{
							value: model.metadata.xAxisLabel,
							position: "bottom",
							offset: 8,
						}}
					/>
					<YAxis
						type="number"
						dataKey="y"
						domain={[0, yScale.max]}
						ticks={yScale.ticks}
						tickLine={false}
						axisLine={false}
						tickMargin={8}
						label={{
							value: model.metadata.yAxisLabel,
							angle: -90,
							position: "insideLeft",
						}}
					/>
					<ChartTooltip
						cursor={false}
						content={({ active, payload }) => {
							const backboneDatum = payload?.find(
								(item) =>
									(item.payload as BackboneChartDatum | undefined)?.series ===
									"backbone",
							)?.payload as BackboneChartDatum | undefined;
							const datum =
								backboneDatum ??
								(payload?.[0]?.payload as BackboneChartDatum | undefined);

							if (!active || !datum) {
								return null;
							}

							return (
								<BackboneTooltipContent
									datum={datum}
									xAxisLabel={model.metadata.xAxisLabel}
									yAxisLabel={model.metadata.yAxisLabel}
								/>
							);
						}}
					/>
					<Line
						dataKey="y"
						type="linear"
						stroke="var(--color-backbone)"
						strokeWidth={2}
						dot={(props) => (
							<circle
								cx={props.cx}
								cy={props.cy}
								r={4}
								fill="var(--color-backbone)"
							/>
						)}
						activeDot={{
							r: 6,
						}}
					/>
				</LineChart>
			</ChartContainer>
		</div>
	);
}
