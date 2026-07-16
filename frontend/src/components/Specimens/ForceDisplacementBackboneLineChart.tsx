import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
} from "@/components/ui/chart";
import { ForceDisplacementTooltipContent } from "./ForceDisplacementTooltipContent";
import type {
	AxisScale,
	ForceDisplacementBackboneChartDatum,
} from "./forceDisplacementBackboneChart.utils";

type ForceDisplacementBackboneLineChartProps = {
	chartData: ForceDisplacementBackboneChartDatum[];
	xAxisLabel: string;
	yAxisLabel: string;
	xScale: AxisScale;
	yScale: AxisScale;
};

const chartConfig = {
	backbone: {
		label: "Backbone",
		color: "var(--viz-2)",
	},
} satisfies ChartConfig;

export function ForceDisplacementBackboneLineChart({
	chartData,
	xAxisLabel,
	yAxisLabel,
	xScale,
	yScale,
}: ForceDisplacementBackboneLineChartProps) {
	return (
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
						value: xAxisLabel,
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
						value: yAxisLabel,
						angle: -90,
						position: "insideLeft",
					}}
				/>
				<ChartTooltip
					cursor={false}
					content={({ active, payload }) => {
						const backboneDatum = payload?.find(
							(item) =>
								(
									item.payload as
										| ForceDisplacementBackboneChartDatum
										| undefined
								)?.series === "backbone",
						)?.payload as ForceDisplacementBackboneChartDatum | undefined;
						const datum =
							backboneDatum ??
							(payload?.[0]?.payload as
								| ForceDisplacementBackboneChartDatum
								| undefined);

						if (!active || !datum) {
							return null;
						}

						return (
							<ForceDisplacementTooltipContent
								datum={datum}
								xAxisLabel={xAxisLabel}
								yAxisLabel={yAxisLabel}
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
	);
}
