import type {
	BackboneChartInput,
	BackboneChartMetadata,
	BackboneChartMode,
	BackboneChartModel,
	BackboneChartPoint,
	BackboneChartReadyModel,
	BackboneChartSegment,
} from "./backboneChart.types";

// Turns normalized backbone inputs into the chart model used by the UI.
// Maps the chosen chart mode to one common set of axis values and labels.
type AxisSet = {
	stiffness: number | null;
	ductility: number | null;
	xYield: number | null;
	yYield: number | null;
	xMax: number | null;
	yMax: number | null;
	xUltimate: number | null;
	yUltimate: number | null;
	xSymbolYield: string;
	xSymbolMax: string;
	xSymbolUltimate: string;
	ySymbolYield: string;
	ySymbolMax: string;
	ySymbolUltimate: string;
	xAxisTitle: string;
	yAxisTitle: string;
	xUnit: string | null;
	yUnit: string | null;
	stiffnessUnit: string | null;
};

function isFiniteNumber(value: number | null | undefined): value is number {
	return typeof value === "number" && Number.isFinite(value);
}

function formatValue(value: number, digits = 2) {
	return Number.isInteger(value) ? value.toString() : value.toFixed(digits);
}

function formatQuantity(
	symbol: string,
	value: number | null,
	unit?: string | null,
	digits = 2,
) {
	if (!isFiniteNumber(value)) {
		return undefined;
	}

	const renderedValue = formatValue(value, digits);
	return unit
		? `${symbol} = ${renderedValue} ${unit}`
		: `${symbol} = ${renderedValue}`;
}

function createEmptyModel(
	mode: BackboneChartMode,
	method: BackboneChartInput["method"],
	title: string,
	reason: string,
): BackboneChartModel {
	return {
		status: "empty",
		mode,
		method,
		title,
		reason,
	};
}

// Chooses the correct numbers and labels for the requested chart mode.
function getAxisSet(
	input: BackboneChartInput,
	mode: BackboneChartMode,
): AxisSet {
	if (mode === "moment-rotation") {
		return {
			stiffness: input.stiffness ?? null,
			ductility: input.ductility ?? null,
			xYield: input.thetaY ?? null,
			yYield: input.momentY ?? null,
			xMax: input.thetaMax ?? null,
			yMax: input.momentMax ?? null,
			xUltimate: input.thetaU ?? null,
			yUltimate: input.momentU ?? null,
			xSymbolYield: "θy",
			xSymbolMax: "θmax",
			xSymbolUltimate: "θu",
			ySymbolYield: "My",
			ySymbolMax: "Mmax",
			ySymbolUltimate: "Mu",
			xAxisTitle: "Rotation",
			yAxisTitle: "Moment",
			xUnit: input.xUnit ?? null,
			yUnit: input.yUnit ?? input.unit ?? null,
			stiffnessUnit: input.stiffnessUnit ?? null,
		};
	}

	return {
		stiffness: input.stiffness ?? null,
		ductility: input.ductility ?? null,
		xYield: input.deltaY ?? null,
		yYield: input.forceY ?? null,
		xMax: input.deltaMax ?? null,
		yMax: input.forceMax ?? null,
		xUltimate: input.deltaU ?? null,
		yUltimate: input.forceU ?? null,
		xSymbolYield: "Δy",
		xSymbolMax: "Δmax",
		xSymbolUltimate: "Δu",
		ySymbolYield: "Fy",
		ySymbolMax: "Fmax",
		ySymbolUltimate: "Fu",
		xAxisTitle: "Displacement",
		yAxisTitle: "Force",
		xUnit: input.xUnit ?? "mm",
		yUnit: input.yUnit ?? input.unit ?? "kN",
		stiffnessUnit: input.stiffnessUnit ?? "kN/mm",
	};
}

// Creates the text labels shown by the chart.
function createMetadata(
	method: BackboneChartInput["method"],
	axes: AxisSet,
	notes?: string[],
): BackboneChartMetadata {
	const methodLabel = method ?? "CEN 1/6";
	const xAxisLabel = axes.xUnit
		? `${axes.xAxisTitle} (${axes.xUnit})`
		: axes.xAxisTitle;
	const yAxisLabel = axes.yUnit
		? `${axes.yAxisTitle} (${axes.yUnit})`
		: axes.yAxisTitle;

	return {
		methodLabel,
		xAxisLabel,
		yAxisLabel,
		stiffnessLabel: formatQuantity("Ks", axes.stiffness, axes.stiffnessUnit),
		ductilityLabel: formatQuantity("μ", axes.ductility, undefined),
		notes,
	};
}

// Wraps a successful result in the final model shape.
function createReadyModel(
	mode: BackboneChartMode,
	method: BackboneChartInput["method"],
	points: BackboneChartPoint[],
	segments: BackboneChartSegment[],
	metadata: BackboneChartMetadata,
): BackboneChartReadyModel {
	return {
		status: "ready",
		mode,
		method,
		points,
		segments,
		metadata,
	};
}

// Creates a chart point with an optional label.
function createPoint(
	key: BackboneChartPoint["key"],
	x: number,
	y: number,
	label?: string,
	showMarker = true,
): BackboneChartPoint {
	return {
		key,
		x,
		y,
		label,
		showMarker,
	};
}

function createSegment(
	from: BackboneChartSegment["from"],
	to: BackboneChartSegment["to"],
	kind: BackboneChartSegment["kind"],
): BackboneChartSegment {
	return {
		from,
		to,
		kind,
	};
}

// The standard backbone: origin -> yield -> peak -> ultimate.
function buildCenModel(
	mode: BackboneChartMode,
	method: BackboneChartInput["method"],
	axes: AxisSet,
): BackboneChartModel {
	if (
		!isFiniteNumber(axes.xYield) ||
		!isFiniteNumber(axes.yYield) ||
		!isFiniteNumber(axes.xMax) ||
		!isFiniteNumber(axes.yMax) ||
		!isFiniteNumber(axes.xUltimate) ||
		!isFiniteNumber(axes.yUltimate)
	) {
		return createEmptyModel(
			mode,
			method,
			"Backbone unavailable",
			"Yield, maximum, and ultimate coordinates are required for this backbone.",
		);
	}

	const points: BackboneChartPoint[] = [
		createPoint("origin", 0, 0, "(0, 0)"),
		createPoint("yield", axes.xYield, axes.yYield, axes.ySymbolYield),
		createPoint("peak", axes.xMax, axes.yMax, axes.ySymbolMax),
		createPoint(
			"ultimate",
			axes.xUltimate,
			axes.yUltimate,
			axes.ySymbolUltimate,
		),
	];

	return createReadyModel(
		mode,
		method,
		points,
		[
			createSegment(
				{ x: 0, y: 0 },
				{ x: axes.xYield, y: axes.yYield },
				"elastic",
			),
			createSegment(
				{ x: axes.xYield, y: axes.yYield },
				{ x: axes.xMax, y: axes.yMax },
				"hardening",
			),
			createSegment(
				{ x: axes.xMax, y: axes.yMax },
				{ x: axes.xUltimate, y: axes.yUltimate },
				"softening",
			),
		],
		createMetadata(method, axes),
	);
}

// EEEP is shown as an elastic segment followed by a flat plateau.
function buildEeepModel(
	mode: BackboneChartMode,
	method: BackboneChartInput["method"],
	axes: AxisSet,
): BackboneChartModel {
	if (
		!isFiniteNumber(axes.stiffness) ||
		!isFiniteNumber(axes.xYield) ||
		!isFiniteNumber(axes.yYield) ||
		!isFiniteNumber(axes.xUltimate)
	) {
		return createEmptyModel(
			mode,
			method,
			"EEEP backbone unavailable",
			"EEEP needs Ks, effective yield coordinates, and an ultimate displacement.",
		);
	}

	if (axes.xUltimate <= axes.xYield) {
		return createEmptyModel(
			mode,
			method,
			"EEEP backbone unavailable",
			"The available values do not produce a valid EEEP plateau.",
		);
	}

	const plateauY = axes.yYield;
	const points: BackboneChartPoint[] = [
		createPoint("origin", 0, 0, "(0, 0)"),
		createPoint(
			"yield",
			axes.xYield,
			axes.yYield,
			`${axes.ySymbolYield} (EEEP)`,
		),
		createPoint("ultimate", axes.xUltimate, plateauY, axes.ySymbolUltimate),
	];

	if (isFiniteNumber(axes.xMax) && isFiniteNumber(axes.yMax)) {
		points.push(
			createPoint("measured-max", axes.xMax, axes.yMax, "Measured max", false),
		);
	}

	return createReadyModel(
		mode,
		method,
		points,
		[
			createSegment(
				{ x: 0, y: 0 },
				{ x: axes.xYield, y: axes.yYield },
				"elastic",
			),
			createSegment(
				{ x: axes.xYield, y: axes.yYield },
				{ x: axes.xUltimate, y: plateauY },
				"plateau",
			),
		],
		createMetadata(method, axes, [
			"Post-yield response shown as an EEEP plateau",
		]),
	);
}

// Builds the chart model used by the Specimen page.
export function buildBackboneChartModel(
	input: BackboneChartInput,
): BackboneChartModel {
	const mode = input.mode ?? "force-displacement";
	const axes = getAxisSet(input, mode);

	switch (input.method) {
		case "EEEP":
			return buildEeepModel(mode, input.method, axes);
		default:
			return buildCenModel(mode, input.method, axes);
	}
}
