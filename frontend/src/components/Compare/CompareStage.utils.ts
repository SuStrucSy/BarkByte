import type { SpecimenPublic } from "@/api/model";
import {
	COMPARE_SECTION_CONFIG,
	type CompareSectionTitle,
	EXPERIMENTAL_COMPARE_FIELDS,
	META_COMPARE_FIELDS,
	RADAR_METRIC_FIELDS,
	STRUCTURAL_COMPARE_FIELDS,
} from "@/lib/compare";
import { formatInlineCompareValue } from "./CompareValueFormatters";

const HIDDEN_COMPARE_FIELDS = new Set<keyof SpecimenPublic>([
	"id",
	"uploader_id",
]);

export type CompareField = {
	key: keyof SpecimenPublic;
	render: (specimen: SpecimenPublic) => { text: string; isMissing: boolean };
};

export type CompareSection = {
	title: CompareSectionTitle;
	fields: CompareField[];
};

function isHiddenCompareField(key: keyof SpecimenPublic) {
	return HIDDEN_COMPARE_FIELDS.has(key);
}

export function getCompareFields(): CompareField[] {
	const orderedKeys = [
		...META_COMPARE_FIELDS,
		...STRUCTURAL_COMPARE_FIELDS,
		...EXPERIMENTAL_COMPARE_FIELDS,
	];

	const uniqueKeys = Array.from(new Set(orderedKeys)).filter(
		(key) => !isHiddenCompareField(key),
	);

	return uniqueKeys.map((key) => ({
		key,
		render: (currentSpecimen) =>
			formatInlineCompareValue(key, currentSpecimen[key]),
	}));
}

export function groupCompareFields(fields: CompareField[]): CompareSection[] {
	return COMPARE_SECTION_CONFIG.map(({ title, keys }) => {
		const fieldMap = new Map(fields.map((field) => [field.key, field]));
		const sectionKeys =
			title === "Experimental Data"
				? keys.filter((key) => !RADAR_METRIC_FIELDS.includes(key))
				: keys;

		return {
			title,
			fields: sectionKeys
				.map((key) => fieldMap.get(key))
				.filter((field): field is CompareField => Boolean(field)),
		};
	}).filter((section) => section.fields.length > 0);
}
