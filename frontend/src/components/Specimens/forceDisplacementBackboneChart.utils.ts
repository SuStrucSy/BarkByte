import type { BackboneChartReadyModel } from "./backboneChart.types";

export type ForceDisplacementBackboneChartDatum = {
	x: number;
	y: number;
	key: string;
	label: string;
	series: "backbone";
};

export type AxisLabelInfo = {
	name: string;
	unit: string | null;
};

export type AxisScale = {
	max: number;
	ticks: number[];
};

export type ForceDisplacementMetricBadge = {
	label: string;
	name: string;
};

export type ForceDisplacementBackboneChartViewModel = {
	chartData: ForceDisplacementBackboneChartDatum[];
	xScale: AxisScale;
	yScale: AxisScale;
	measureBadges: ForceDisplacementMetricBadge[];
};

export function splitAxisLabel(axisLabel: string): AxisLabelInfo {
	const match = axisLabel.match(/^(.*?)\s*\((.+)\)$/);
	if (!match) {
		return { name: axisLabel, unit: null };
	}

	return {
		name: match[1]?.trim() ?? axisLabel,
		unit: match[2]?.trim() ?? null,
	};
}

export function formatTooltipValue(value: number, unit: string | null) {
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

function buildAxisScale(maxValue: number, targetIntervals = 4): AxisScale {
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

function buildBackbonePathData(
	model: BackboneChartReadyModel,
): ForceDisplacementBackboneChartDatum[] {
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

	const path: ForceDisplacementBackboneChartDatum[] = [
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

function buildMeasureBadges(model: BackboneChartReadyModel) {
	const xAxisInfo = splitAxisLabel(model.metadata.xAxisLabel);
	const yAxisInfo = splitAxisLabel(model.metadata.yAxisLabel);
	const pointByKey = new Map(model.points.map((point) => [point.key, point]));
	const maxPoint = pointByKey.get("peak") ?? pointByKey.get("measured-max");
	const yieldPoint = pointByKey.get("yield");
	const ultimatePoint = pointByKey.get("ultimate");

	const badges: Array<ForceDisplacementMetricBadge | undefined> = [
		model.metadata.stiffnessLabel
			? {
					label: model.metadata.stiffnessLabel,
					name: "Stiffness",
				}
			: undefined,
		model.metadata.ductilityLabel
			? {
					label: model.metadata.ductilityLabel,
					name: "Ductility",
				}
			: undefined,
		yieldPoint
			? {
					label: formatBadgeValue("Δy", yieldPoint.x, xAxisInfo.unit),
					name: "Yield displacement",
				}
			: undefined,
		yieldPoint
			? {
					label: formatBadgeValue("Fy", yieldPoint.y, yAxisInfo.unit),
					name: "Yield force",
				}
			: undefined,
		maxPoint
			? {
					label: formatBadgeValue("Δmax", maxPoint.x, xAxisInfo.unit),
					name: "Maximum displacement",
				}
			: undefined,
		maxPoint
			? {
					label: formatBadgeValue("Fmax", maxPoint.y, yAxisInfo.unit),
					name: "Maximum force",
				}
			: undefined,
		ultimatePoint
			? {
					label: formatBadgeValue("Δu", ultimatePoint.x, xAxisInfo.unit),
					name: "Ultimate displacement",
				}
			: undefined,
		ultimatePoint
			? {
					label: formatBadgeValue("Fu", ultimatePoint.y, yAxisInfo.unit),
					name: "Ultimate force",
				}
			: undefined,
	];

	return badges.filter((badge): badge is ForceDisplacementMetricBadge =>
		Boolean(badge),
	);
}

export function buildForceDisplacementBackboneChartViewModel(
	model: BackboneChartReadyModel,
): ForceDisplacementBackboneChartViewModel {
	const chartData = buildBackbonePathData(model);

	return {
		chartData,
		xScale: buildAxisScale(
			Math.max(...chartData.map((point) => point.x), 1) * 1.05,
		),
		yScale: buildAxisScale(
			Math.max(...chartData.map((point) => point.y), 1) * 1.1,
		),
		measureBadges: buildMeasureBadges(model),
	};
}
