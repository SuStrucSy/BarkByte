import { Pie, PieChart, type PieLabelRenderProps } from "recharts";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import type { ItemCount } from "@/lib/utils";

interface DonutProps {
	counts: Record<string, ItemCount>;
	maxSlices?: number;
	otherLabel?: string;
}

type PieDatum = {
	id: string;
	label: string;
	count: number;
	fill: string;
	otherBreakdown?: ItemCount[];
};

const PIE_PALETTE = [
	"var(--viz-1)",
	"var(--viz-2)",
	"var(--viz-3)",
	"var(--viz-4)",
	"var(--viz-5)",
	"var(--viz-6)",
] as const;

const renderPieLabel = ({
	cx,
	cy,
	midAngle,
	outerRadius,
	percent,
	name,
}: PieLabelRenderProps) => {
	if (
		cx === null ||
		cy === null ||
		outerRadius === null ||
		midAngle === undefined ||
		percent === undefined ||
		!name
	) {
		return null;
	}

	const radians = Math.PI / 180;
	const radius = outerRadius * 1.16;
	const x = cx + radius * Math.cos(-midAngle * radians);
	const y = cy + radius * Math.sin(-midAngle * radians);
	const compactName =
		name.length > 18 ? `${name.slice(0, 17).trimEnd()}…` : name;

	return (
		<text
			x={x}
			y={y}
			textAnchor={x > cx ? "start" : "end"}
			dominantBaseline="central"
			className="fill-foreground text-[10px] font-medium"
		>
			{compactName}
		</text>
	);
};

export function Donut({
	counts,
	maxSlices = 6,
	otherLabel = "Other",
}: DonutProps) {
	const entries = Object.entries(counts)
		.map(([id, item]) => ({ id, ...item }))
		.sort((a, b) => b.count - a.count);

	const groupedEntries =
		maxSlices > 0 && entries.length > maxSlices
			? (() => {
					const main = entries.slice(0, Math.max(maxSlices - 1, 1));
					const minor = entries.slice(Math.max(maxSlices - 1, 1));

					return [
						...main,
						{
							id: "__other__",
							label: otherLabel,
							count: minor.reduce((sum, item) => sum + item.count, 0),
							otherBreakdown: minor.map(({ label, count }) => ({
								label,
								count,
							})),
						},
					];
				})()
			: entries;

	const chartData: PieDatum[] = groupedEntries.map((item, index) => ({
		id: item.id,
		label: item.label,
		count: item.count,
		fill: PIE_PALETTE[index % PIE_PALETTE.length],
		otherBreakdown: item.otherBreakdown,
	}));

	const chartConfig = chartData.reduce<ChartConfig>((acc, item, index) => {
		acc[item.label] = {
			label: item.label,
			color: PIE_PALETTE[index % PIE_PALETTE.length],
		};
		return acc;
	}, {}) satisfies ChartConfig;

	return (
		<ChartContainer config={chartConfig} className="w-full max-h-87.5">
			<PieChart responsive>
				<ChartTooltip
					content={
						<ChartTooltipContent
							hideLabel
							formatter={(value, _name, item) => {
								const payload = item.payload as PieDatum;
								const count =
									typeof value === "number" ? value.toLocaleString() : value;

								return (
									<div className="min-w-[12rem] space-y-1">
										<div className="flex items-center justify-between gap-3">
											<span className="text-muted-foreground">
												{payload.label}
											</span>
											<span className="text-foreground font-mono font-medium tabular-nums">
												{count}
											</span>
										</div>
										{payload.otherBreakdown?.length ? (
											<div className="border-border/50 space-y-1 border-t pt-2">
												<div className="text-muted-foreground text-[10px] uppercase tracking-[0.12em]">
													Breakdown
												</div>
												{payload.otherBreakdown.map((entry) => (
													<div
														key={entry.label}
														className="flex items-center justify-between gap-3 text-xs"
													>
														<span className="text-muted-foreground">
															{entry.label}
														</span>
														<span className="text-foreground font-mono tabular-nums">
															{entry.count.toLocaleString()}
														</span>
													</div>
												))}
											</div>
										) : null}
									</div>
								);
							}}
						/>
					}
				/>
				<Pie
					data={chartData}
					dataKey="count"
					label={renderPieLabel}
					labelLine
					nameKey="label"
					innerRadius="42%"
					outerRadius="78%"
					cx="50%"
					cy="50%"
				/>
			</PieChart>
		</ChartContainer>
	);
}
