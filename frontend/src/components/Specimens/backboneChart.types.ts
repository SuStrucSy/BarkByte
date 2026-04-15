import type { YieldPointMethod } from "@/api/model";

// Shared types for the specimen backbone chart.
export type BackboneChartMode = "force-displacement" | "moment-rotation";

export type BackboneChartSegmentKind =
	| "elastic"
	| "hardening"
	| "plateau"
	| "softening";

export type BackboneChartPointKey =
	| "origin"
	| "yield"
	| "peak"
	| "ultimate"
	| "measured-max";

// A point shown on or associated with the backbone chart.
export type BackboneChartPoint = {
	key: BackboneChartPointKey;
	x: number;
	y: number;
	label?: string;
	showMarker?: boolean;
};

// A straight line segment in the simplified backbone.
export type BackboneChartSegment = {
	from: { x: number; y: number };
	to: { x: number; y: number };
	kind: BackboneChartSegmentKind;
};

// Labels the chart can show directly.
export type BackboneChartMetadata = {
	methodLabel: string;
	xAxisLabel: string;
	yAxisLabel: string;
	stiffnessLabel?: string;
	ductilityLabel?: string;
	notes?: string[];
};

export type BackboneChartReadyModel = {
	status: "ready";
	mode: BackboneChartMode;
	method: YieldPointMethod | null;
	points: BackboneChartPoint[];
	segments: BackboneChartSegment[];
	metadata: BackboneChartMetadata;
};

export type BackboneChartEmptyModel = {
	status: "empty";
	mode: BackboneChartMode;
	method: YieldPointMethod | null;
	title: string;
	reason: string;
};

export type BackboneChartModel =
	| BackboneChartReadyModel
	| BackboneChartEmptyModel;

// Input values for either force-displacement or moment-rotation charts.
export type BackboneChartInput = {
	method: YieldPointMethod | null;
	mode?: BackboneChartMode;
	unit?: string | null;
	xUnit?: string | null;
	yUnit?: string | null;
	stiffnessUnit?: string | null;
	ductility?: number | null;
	stiffness?: number | null;
	deltaY?: number | null;
	forceY?: number | null;
	deltaMax?: number | null;
	forceMax?: number | null;
	deltaU?: number | null;
	forceU?: number | null;
	thetaY?: number | null;
	momentY?: number | null;
	thetaMax?: number | null;
	momentMax?: number | null;
	thetaU?: number | null;
	momentU?: number | null;
};
