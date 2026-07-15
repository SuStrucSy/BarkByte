import { cn } from "@/lib/utils";
import type {
	BackboneChartEmptyModel,
	BackboneChartReadyModel,
} from "./backboneChart.types";
import { ForceDisplacementBackboneEmptyState } from "./ForceDisplacementBackboneEmptyState";
import { ForceDisplacementBackboneLineChart } from "./ForceDisplacementBackboneLineChart";
import { ForceDisplacementMetricBadges } from "./ForceDisplacementMetricBadges";
import { buildForceDisplacementBackboneChartViewModel } from "./forceDisplacementBackboneChart.utils";

// Renders the specimen backbone chart from a ready chart model.
type ForceDisplacementBackboneChartProps = {
	model: BackboneChartReadyModel | BackboneChartEmptyModel;
	className?: string;
};

export function ForceDisplacementBackboneChart({
	model,
	className,
}: ForceDisplacementBackboneChartProps) {
	if (model.status === "empty") {
		return (
			<ForceDisplacementBackboneEmptyState
				model={model}
				className={className}
			/>
		);
	}

	const { chartData, measureBadges, xScale, yScale } =
		buildForceDisplacementBackboneChartViewModel(model);

	return (
		<div
			className={cn("flex h-full min-h-95 w-full min-w-0 flex-col", className)}
		>
			<ForceDisplacementMetricBadges labels={measureBadges} />
			<p className="pt-2 pb-3 text-left text-base font-medium text-foreground">
				Force-Displacement Backbone Curve
			</p>
			<ForceDisplacementBackboneLineChart
				chartData={chartData}
				xAxisLabel={model.metadata.xAxisLabel}
				yAxisLabel={model.metadata.yAxisLabel}
				xScale={xScale}
				yScale={yScale}
			/>
		</div>
	);
}
