import {
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
	ResponsiveContainer,
} from "recharts";

import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
	value: {
		label: "Value",
		color: "var(--viz-radar)",
	},
} satisfies ChartConfig;

/*
Maybe TODO: need to get real 5th and 95th percentile values from db

5th and 95th percentile average ranges per metric (raw units)
note: using min–max (5th–95th) normalization assumes a roughly linear distribution, and the data is clearly right-skewed (many small values, few large ones). That’s why almost everything collapses near zero on the radar and the radar looks ugly. So I'm using a log scale to spread out the lower values more so that the radar looks better.
*/
const metricRanges: Record<string, { min: number; max: number }> = {
	"Max Force": { min: 6.9, max: 382.3 },
	"Max Displacement": { min: 3.7, max: 47.4 },
	Stiffness: { min: 0.86, max: 131 },
	"Ultimate Force": { min: 5.5, max: 336.8 },
	"Ultimate Displacement": { min: 7.1, max: 63.8 },
	"Yield Force": { min: 5, max: 320.5 },
	"Yield Displacement": { min: 1.2, max: 20.2 },
	Ductility: { min: 5.5, max: 336.8 },
};

const metricUnits: Record<string, string> = {
	"Max Force": "kN",
	"Ultimate Force": "kN",
	"Yield Force": "kN",
	"Max Displacement": "mm",
	"Ultimate Displacement": "mm",
	"Yield Displacement": "mm",
	Stiffness: "kN/mm",
	Ductility: "",
};

const tickSymbols: Record<string, string> = {
	Stiffness: "Ks",
	"Yield Displacement": "Δy",
	"Yield Force": "Fy",
	"Max Displacement": "Δmax",
	"Max Force": "Fmax",
	"Ultimate Displacement": "Δu",
	"Ultimate Force": "Fu",
	Ductility: "μ",
};

function normalizeMetric(metric: string, rawValue: number) {
	const range = metricRanges[metric];
	if (!range || range.max <= range.min) return 0;

	// Clamp to avoid log(0) or negatives
	const safeValue = Math.max(rawValue, range.min);
	const safeMin = Math.max(range.min, 1e-6);
	const safeMax = Math.max(range.max, safeMin + 1e-6);

	const logValue = Math.log(safeValue);
	const logMin = Math.log(safeMin);
	const logMax = Math.log(safeMax);

	const normalized = (logValue - logMin) / (logMax - logMin);
	return Math.max(0, Math.min(1, normalized));
}

type TimverseExperimentMetrics = {
	e_max_force?: number | null;
	e_max_displacement?: number | null;
	e_stiffness?: number | null;
	e_ultimate_force?: number | null;
	e_ultimate_displacement?: number | null;
	e_yield_force?: number | null;
	e_yield_displacement?: number | null;
	e_ductility?: number | null;
};

type RadarMetricsChartProps = {
	data: TimverseExperimentMetrics;
	className?: string;
	syncId?: string;
};

export function RadarMetricsChart({
	data,
	className,
	syncId,
}: RadarMetricsChartProps) {
	const chartData = [
		{ metric: "Max Force", rawValue: Number(data.e_max_force ?? 0) },
		{
			metric: "Max Displacement",
			rawValue: Number(data.e_max_displacement ?? 0),
		},
		{ metric: "Stiffness", rawValue: Number(data.e_stiffness ?? 0) },
		{ metric: "Ultimate Force", rawValue: Number(data.e_ultimate_force ?? 0) },
		{
			metric: "Ultimate Displacement",
			rawValue: Number(data.e_ultimate_displacement ?? 0),
		},
		{ metric: "Yield Force", rawValue: Number(data.e_yield_force ?? 0) },
		{
			metric: "Yield Displacement",
			rawValue: Number(data.e_yield_displacement ?? 0),
		},
		{ metric: "Ductility", rawValue: Number(data.e_ductility ?? 0) },
	].map((d) => ({
		...d,
		value: normalizeMetric(d.metric, d.rawValue),
	}));

	return (
		<ChartContainer
			config={chartConfig}
			className={[
				"mx-auto aspect-square w-full min-w-0 max-w-[520px] overflow-visible",
				className,
			]
				.filter(Boolean)
				.join(" ")}
		>
			<ResponsiveContainer
				width="100%"
				height="100%"
				minWidth={0}
				minHeight={0}
			>
				<RadarChart
					data={chartData}
					syncId={syncId}
					outerRadius="100%"
					margin={{ top: 22, right: 22, bottom: 22, left: 22 }}
				>
					<ChartTooltip
						cursor={false}
						content={
							<ChartTooltipContent
								hideLabel
								formatter={(_, __, item) => (
									<div className="grid min-w-[220px] grid-cols-[1fr_minmax(80px,max-content)] items-center gap-2 text-xs">
										<span className="truncate text-muted-foreground">
											{item.payload.metric}
										</span>
										<div className="flex items-baseline justify-end gap-0.5 font-mono font-medium tabular-nums text-foreground">
											{item.payload.rawValue}
											<span className="text-muted-foreground font-normal">
												{metricUnits[item.payload.metric] ?? ""}
											</span>
										</div>
									</div>
								)}
							/>
						}
					/>
					<PolarAngleAxis
						dataKey="metric"
						tick={{ fontSize: 12, dy: 6 }}
						tickFormatter={(v) => tickSymbols[String(v)] ?? String(v)}
					/>
					<PolarGrid />
					<PolarRadiusAxis domain={[0, 1]} tick={false} axisLine={false} />
					<Radar
						dataKey="value"
						fill="var(--color-value)"
						fillOpacity={0.6}
						stroke="var(--color-value)"
					/>
				</RadarChart>
			</ResponsiveContainer>
		</ChartContainer>
	);
}
