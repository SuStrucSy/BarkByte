import type { PendingSpecimenUpdate, SpecimenPublic } from "@/api/model";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";

const EDITABLE_FIELDS = [
	"specimen_reference_id",
	"assembly_type",
	"joinery_type_id",
	"sub_joinery_type_id",
	"fastener_type_ids",
	"loading_direction_ids",
	"practice",
	"fastener_numbers",
	"connector",
	"dowel",
	"replicate_tests",
	"connection_description",
	"note",
	"element_dimension",
	"moisture_percentage",
	"wood_type",
	"wood_mechanical_properties",
	"fastener_mechanical_properties",
	"connector_mechanical_properties",
	"e_stiffness",
	"e_yield_force",
	"e_yield_displacement",
	"e_max_force",
	"e_max_displacement",
	"e_ultimate_force",
	"e_ultimate_displacement",
	"e_ductility",
	"e_test_loading_type",
	"e_yield_point_method",
	"e_date",
	"e_qualitative_failure_measure",
	"e_qfm_description",
] as const satisfies ReadonlyArray<keyof PendingSpecimenUpdate>;

const NULLABLE_STRING_FIELDS = new Set<keyof PendingSpecimenUpdate>([
	"connection_description",
	"note",
	"moisture_percentage",
	"wood_type",
	"wood_mechanical_properties",
	"fastener_mechanical_properties",
	"connector_mechanical_properties",
	"e_date",
	"e_qfm_description",
]);

const MULTILINE_TEXT_FIELDS = new Set<keyof PendingSpecimenUpdate>([
	"connection_description",
	"note",
	"e_qfm_description",
]);

type EditableField = (typeof EDITABLE_FIELDS)[number];

export function getEmptySpecimenFormValues(): AddNewSpecimenFormValues {
	return {
		doi_id: undefined,
		authors: "",
		link: "",
		pub_year: new Date().getFullYear(),
		ref_title: "",
		specimen_reference_id: "",
		assembly_type: undefined as AddNewSpecimenFormValues["assembly_type"],
		joinery_type_id: "",
		sub_joinery_type_id: "",
		fastener_type_ids: [],
		loading_direction_ids: [],
		practice: undefined as AddNewSpecimenFormValues["practice"],
		fastener_numbers: 1,
		connector: false,
		dowel: false,
		replicate_tests: 1,
		connection_description: "",
		note: "",
		element_dimension: "",
		moisture_percentage: "",
		wood_type: "",
		wood_mechanical_properties: "",
		fastener_mechanical_properties: "",
		connector_mechanical_properties: "",
		e_stiffness: null,
		e_yield_force: null,
		e_yield_displacement: null,
		e_max_force: null,
		e_max_displacement: null,
		e_ultimate_force: null,
		e_ultimate_displacement: null,
		e_ductility: null,
		e_test_loading_type: null,
		e_yield_point_method: null,
		e_date: "",
		e_qfm_description: "",
		e_qualitative_failure_measure: [],
	};
}

function sortJsonLike(value: unknown): unknown {
	if (Array.isArray(value)) {
		return [...value]
			.map((entry) => sortJsonLike(entry))
			.sort((left, right) =>
				JSON.stringify(left).localeCompare(JSON.stringify(right)),
			);
	}

	if (value && typeof value === "object") {
		return Object.fromEntries(
			Object.entries(value as Record<string, unknown>)
				.sort(([left], [right]) => left.localeCompare(right))
				.map(([key, entry]) => [key, sortJsonLike(entry)]),
		);
	}

	return value;
}

function normalizeStringForPayload(
	field: EditableField,
	value: string,
): string | null {
	const trimmed = value.trim();
	if (NULLABLE_STRING_FIELDS.has(field) && trimmed === "") {
		return null;
	}
	return trimmed;
}

function normalizeStringForDiff(
	field: EditableField,
	value: string,
): string | null {
	const normalizedValue = MULTILINE_TEXT_FIELDS.has(field)
		? value.replace(/\s+/g, "")
		: value.trim();
	if (NULLABLE_STRING_FIELDS.has(field) && normalizedValue === "") {
		return null;
	}
	return normalizedValue;
}

function normalizeFieldValueForPayload(
	field: EditableField,
	value: unknown,
): unknown {
	if (typeof value === "string") {
		return normalizeStringForPayload(field, value);
	}

	if (Array.isArray(value) || (value && typeof value === "object")) {
		return sortJsonLike(value);
	}

	return value ?? null;
}

function normalizeFieldValueForDiff(
	field: EditableField,
	value: unknown,
): unknown {
	if (typeof value === "string") {
		return normalizeStringForDiff(field, value);
	}

	if (Array.isArray(value) || (value && typeof value === "object")) {
		return sortJsonLike(value);
	}

	return value ?? null;
}

function valuesAreEqual(
	field: EditableField,
	left: unknown,
	right: unknown,
): boolean {
	return (
		JSON.stringify(normalizeFieldValueForDiff(field, left)) ===
		JSON.stringify(normalizeFieldValueForDiff(field, right))
	);
}

export function getSpecimenFormValues(
	specimen: SpecimenPublic,
): AddNewSpecimenFormValues {
	return {
		doi_id: specimen.doi.id,
		authors: specimen.doi.authors,
		link: specimen.doi.link,
		pub_year: specimen.doi.pub_year,
		ref_title: specimen.doi.ref_title,
		specimen_reference_id: specimen.specimen_reference_id,
		assembly_type: specimen.assembly_type,
		joinery_type_id: specimen.joinery_type.id,
		sub_joinery_type_id: specimen.sub_joinery_type.id,
		fastener_type_ids: specimen.fastener_types.map((item) => item.id),
		loading_direction_ids: specimen.loading_directions.map((item) => item.id),
		practice: specimen.practice,
		fastener_numbers: specimen.fastener_numbers,
		connector: specimen.connector,
		dowel: specimen.dowel,
		replicate_tests: specimen.replicate_tests,
		connection_description: specimen.connection_description ?? "",
		note: specimen.note ?? "",
		element_dimension: specimen.element_dimension ?? "",
		moisture_percentage: specimen.moisture_percentage ?? "",
		wood_type: specimen.wood_type ?? "",
		wood_mechanical_properties: specimen.wood_mechanical_properties ?? "",
		fastener_mechanical_properties:
			specimen.fastener_mechanical_properties ?? "",
		connector_mechanical_properties:
			specimen.connector_mechanical_properties ?? "",
		e_stiffness: specimen.e_stiffness,
		e_yield_force: specimen.e_yield_force,
		e_yield_displacement: specimen.e_yield_displacement,
		e_max_force: specimen.e_max_force,
		e_max_displacement: specimen.e_max_displacement,
		e_ultimate_force: specimen.e_ultimate_force,
		e_ultimate_displacement: specimen.e_ultimate_displacement,
		e_ductility: specimen.e_ductility,
		e_test_loading_type: specimen.e_test_loading_type,
		e_yield_point_method: specimen.e_yield_point_method,
		e_date: specimen.e_date ?? "",
		e_qfm_description: specimen.e_qfm_description ?? "",
		e_qualitative_failure_measure: specimen.e_qualitative_failure_measure.map(
			(item) => item.id,
		),
	};
}

function normalizePendingFieldValueForForm(
	field: EditableField,
	value: unknown,
): AddNewSpecimenFormValues[EditableField] {
	if (typeof value === "string") {
		return (
			NULLABLE_STRING_FIELDS.has(field) && value === "" ? "" : value
		) as AddNewSpecimenFormValues[EditableField];
	}

	if (value === null && NULLABLE_STRING_FIELDS.has(field)) {
		return "" as AddNewSpecimenFormValues[EditableField];
	}

	if (Array.isArray(value)) {
		return [...value] as AddNewSpecimenFormValues[EditableField];
	}

	return value as AddNewSpecimenFormValues[EditableField];
}

export function mergeSpecimenFormValuesWithPendingChanges(
	originalValues: AddNewSpecimenFormValues,
	changedData: Record<string, unknown> | undefined,
): AddNewSpecimenFormValues {
	if (!changedData) {
		return originalValues;
	}

	const mergedValues = { ...originalValues };

	for (const field of EDITABLE_FIELDS) {
		if (!(field in changedData)) {
			continue;
		}

		mergedValues[field] = normalizePendingFieldValueForForm(
			field,
			changedData[field],
		);
	}

	return mergedValues;
}

export function buildSpecimenEditDiff(
	originalValues: AddNewSpecimenFormValues,
	currentValues: AddNewSpecimenFormValues,
): PendingSpecimenUpdate {
	const diff: PendingSpecimenUpdate = {};

	for (const field of EDITABLE_FIELDS) {
		if (valuesAreEqual(field, originalValues[field], currentValues[field])) {
			continue;
		}

		diff[field] = normalizeFieldValueForPayload(
			field,
			currentValues[field],
		) as PendingSpecimenUpdate[typeof field];
	}

	return diff;
}
