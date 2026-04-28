import { saveAs } from "file-saver";
import Papa from "papaparse";
import z from "zod/v4";
import type { SpecimenPublic } from "@/api/model";
import {
	SLIDER_FILTER_CONFIG,
	type SliderField,
} from "@/components/Data-Table/specimenTableFilters";

const sliderSearchSchemaFields = Object.fromEntries(
	SLIDER_FILTER_CONFIG.map((config) => [config.field, z.string().optional()]),
) as Record<SliderField, z.ZodOptional<z.ZodString>>;

export const specimensSearchSchema = z.object({
	q: z.string().catch(""),
	...sliderSearchSchemaFields,
});

export type Bounds = { min: number; max: number };

export const isNonEmptyString = (value: unknown): value is string =>
	typeof value === "string" && value.trim().length > 0;

export const getNumberBounds = (
	values: Array<number | null | undefined>,
): Bounds => {
	const nums = values.filter(
		(value): value is number =>
			typeof value === "number" && Number.isFinite(value),
	);
	if (!nums.length) return { min: 0, max: 0 };
	return { min: Math.min(...nums), max: Math.max(...nums) };
};

export function exportSpecimensToCsv(rows: SpecimenPublic[]) {
	if (!rows.length) return;

	try {
		const isIdKey = (key: string) => key === "id" || key.endsWith("_id");

		const flattenRow = (row: SpecimenPublic): Record<string, string> => {
			const flat: Record<string, string> = {};
			for (const [key, value] of Object.entries(row)) {
				if (isIdKey(key)) continue;
				if (key === "doi" && value && typeof value === "object") {
					for (const [dKey, dVal] of Object.entries(value as object)) {
						if (!isIdKey(dKey)) flat[`doi_${dKey}`] = String(dVal ?? "");
					}
				} else if (
					key === "joinery_type" &&
					value &&
					typeof value === "object"
				) {
					const v = value as { label: string; has_dowel: boolean };
					flat.joinery_type = v.label ?? "";
					flat.joinery_type_has_dowel = String(v.has_dowel ?? "");
				} else if (
					key === "sub_joinery_type" &&
					value &&
					typeof value === "object"
				) {
					flat.sub_joinery_type = (value as { label: string }).label ?? "";
				} else if (
					key === "e_qualitative_failure_measure" &&
					Array.isArray(value)
				) {
					flat.failure_modes = value.map((v) => v.label).join("; ");
					flat.failure_mode_types = value.map((v) => v.type).join("; ");
				} else if (key === "fastener_types" && Array.isArray(value)) {
					flat.fastener_types = value.map((v) => v.label).join("; ");
				} else if (key === "loading_directions" && Array.isArray(value)) {
					flat.loading_directions = value.map((v) => v.label).join("; ");
				} else if (Array.isArray(value)) {
					flat[key] = value.join("; ");
				} else {
					flat[key] =
						value === null || value === undefined ? "" : String(value);
				}
			}
			return flat;
		};

		const flatRows = rows.map(flattenRow);
		const csv = Papa.unparse(flatRows);
		const blob = new Blob([`\uFEFF${csv}`], {
			type: "text/csv;charset=utf-8;",
		});
		saveAs(blob, "specimens.csv");
	} catch (err) {
		console.error("exportSpecimensToCsv failed:", err);
	}
}
