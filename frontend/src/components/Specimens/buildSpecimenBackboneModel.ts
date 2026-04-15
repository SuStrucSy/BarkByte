import type { SpecimenPublic } from "@/api/model";
import { buildBackboneChartModel } from "./buildBackboneChartModel";

// Maps Specimen API fields to the generic backbone chart input shape.
export function buildSpecimenBackboneModel(data: SpecimenPublic) {
	return buildBackboneChartModel({
		method: data.e_yield_point_method ?? null,
		mode: "force-displacement",
		stiffness: data.e_stiffness ?? null,
		ductility: data.e_ductility ?? null,
		deltaY: data.e_yield_displacement ?? null,
		forceY: data.e_yield_force ?? null,
		deltaMax: data.e_max_displacement ?? null,
		forceMax: data.e_max_force ?? null,
		deltaU: data.e_ultimate_displacement ?? null,
		forceU: data.e_ultimate_force ?? null,
		unit: "kN",
		xUnit: "mm",
		yUnit: "kN",
		stiffnessUnit: "kN/mm",
	});
}
