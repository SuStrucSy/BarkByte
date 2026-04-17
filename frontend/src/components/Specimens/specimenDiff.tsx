import type { ReactNode } from "react";
import type {
	PendingSpecimenPublicChangedData,
	SpecimenPublic,
} from "@/api/model";
import { humanizeLabel, renderValue } from "@/lib/utils";

export type SpecimenField = keyof SpecimenPublic;

type LookupItem = {
	id?: string | null;
	label: string;
};

type PendingSpecimenLookupData = {
	failureModes?: SpecimenPublic["e_qualitative_failure_measure"];
	fastenerTypes?: SpecimenPublic["fastener_types"];
	joineryTypes?: SpecimenPublic["joinery_type"][];
	loadingDirections?: SpecimenPublic["loading_directions"];
	subjoineryTypes?: SpecimenPublic["sub_joinery_type"][];
};

const manualLabels: Partial<Record<SpecimenField, string>> = {
	e_qfm_description: "QFM Description",
	e_qualitative_failure_measure: "QFM",
	note: "Specimen Note",
	specimen_reference_id: "Reference Title",
};

export const sectionFields: Record<string, SpecimenField[]> = {
	"Meta Data": [
		"specimen_reference_id",
		"assembly_type",
		"joinery_type",
		"sub_joinery_type",
		"fastener_types",
		"loading_directions",
		"practice",
		"fastener_numbers",
		"connector",
		"dowel",
		"replicate_tests",
		"connection_description",
		"note",
	],
	"Structural Data": [
		"element_dimension",
		"moisture_percentage",
		"wood_type",
		"wood_mechanical_properties",
		"fastener_mechanical_properties",
		"connector_mechanical_properties",
	],
	"Experimental Data": [
		"e_date",
		"e_test_loading_type",
		"e_yield_point_method",
		"e_qualitative_failure_measure",
		"e_qfm_description",
		"e_max_force",
		"e_max_displacement",
		"e_stiffness",
		"e_ultimate_force",
		"e_ultimate_displacement",
		"e_yield_force",
		"e_yield_displacement",
		"e_ductility",
	],
};

export const allSectionFields = Object.values(sectionFields).flat();

const changeKeyMap: Partial<Record<SpecimenField, string[]>> = {
	joinery_type: ["joinery_type_id"],
	sub_joinery_type: ["sub_joinery_type_id"],
	fastener_types: ["fastener_type_ids"],
	loading_directions: ["loading_direction_ids"],
	e_qualitative_failure_measure: ["e_qualitative_failure_measure"],
};

export const fieldUnits: Partial<Record<SpecimenField, string>> = {
	e_max_force: "kN",
	e_max_displacement: "mm",
	e_stiffness: "kN/mm",
	e_ultimate_force: "kN",
	e_ultimate_displacement: "mm",
	e_yield_force: "kN",
	e_yield_displacement: "mm",
};

export function getSpecimenFieldLabel(property: SpecimenField) {
	return manualLabels[property] ?? humanizeLabel(property);
}

export function isSpecimenFieldChanged(
	field: SpecimenField,
	changedData: PendingSpecimenPublicChangedData,
) {
	const changeKeys = changeKeyMap[field] ?? [field];
	return changeKeys.some((key) => changedData[key] !== undefined);
}

export function getChangedSpecimenFields(
	changedData: PendingSpecimenPublicChangedData,
) {
	return allSectionFields.filter((field) =>
		isSpecimenFieldChanged(field, changedData),
	);
}

function filterByIds<T extends LookupItem>(
	items: T[] | undefined,
	ids: string[],
) {
	return (items ?? []).filter((item) => item.id && ids.includes(item.id));
}

export function buildPendingSpecimenDisplayData(
	changedData: PendingSpecimenPublicChangedData,
	lookups: PendingSpecimenLookupData,
): Partial<SpecimenPublic> {
	const changedFastenerIds = Array.isArray(changedData.fastener_type_ids)
		? (changedData.fastener_type_ids as string[])
		: [];
	const changedLoadingDirectionIds = Array.isArray(
		changedData.loading_direction_ids,
	)
		? (changedData.loading_direction_ids as string[])
		: [];
	const changedQfmIds = Array.isArray(changedData.e_qualitative_failure_measure)
		? (changedData.e_qualitative_failure_measure as string[])
		: [];

	return {
		assembly_type: changedData.assembly_type as SpecimenPublic["assembly_type"],
		connection_description: changedData.connection_description as
			| SpecimenPublic["connection_description"]
			| undefined,
		connector: changedData.connector as SpecimenPublic["connector"],
		connector_mechanical_properties:
			changedData.connector_mechanical_properties as SpecimenPublic["connector_mechanical_properties"],
		dowel: changedData.dowel as SpecimenPublic["dowel"],
		e_date: changedData.e_date as SpecimenPublic["e_date"],
		e_ductility: changedData.e_ductility as SpecimenPublic["e_ductility"],
		e_max_displacement:
			changedData.e_max_displacement as SpecimenPublic["e_max_displacement"],
		e_max_force: changedData.e_max_force as SpecimenPublic["e_max_force"],
		e_qfm_description:
			changedData.e_qfm_description as SpecimenPublic["e_qfm_description"],
		e_qualitative_failure_measure: filterByIds(
			lookups.failureModes,
			changedQfmIds,
		),
		e_stiffness: changedData.e_stiffness as SpecimenPublic["e_stiffness"],
		e_test_loading_type:
			changedData.e_test_loading_type as SpecimenPublic["e_test_loading_type"],
		e_ultimate_displacement:
			changedData.e_ultimate_displacement as SpecimenPublic["e_ultimate_displacement"],
		e_ultimate_force:
			changedData.e_ultimate_force as SpecimenPublic["e_ultimate_force"],
		e_yield_displacement:
			changedData.e_yield_displacement as SpecimenPublic["e_yield_displacement"],
		e_yield_force: changedData.e_yield_force as SpecimenPublic["e_yield_force"],
		e_yield_point_method:
			changedData.e_yield_point_method as SpecimenPublic["e_yield_point_method"],
		element_dimension:
			changedData.element_dimension as SpecimenPublic["element_dimension"],
		fastener_mechanical_properties:
			changedData.fastener_mechanical_properties as SpecimenPublic["fastener_mechanical_properties"],
		fastener_numbers:
			changedData.fastener_numbers as SpecimenPublic["fastener_numbers"],
		fastener_types: filterByIds(lookups.fastenerTypes, changedFastenerIds),
		joinery_type: (lookups.joineryTypes ?? []).find(
			(item) => item.id === changedData.joinery_type_id,
		),
		loading_directions: filterByIds(
			lookups.loadingDirections,
			changedLoadingDirectionIds,
		),
		moisture_percentage:
			changedData.moisture_percentage as SpecimenPublic["moisture_percentage"],
		note: changedData.note as SpecimenPublic["note"],
		practice: changedData.practice as SpecimenPublic["practice"],
		replicate_tests:
			changedData.replicate_tests as SpecimenPublic["replicate_tests"],
		specimen_reference_id:
			changedData.specimen_reference_id as SpecimenPublic["specimen_reference_id"],
		sub_joinery_type: (lookups.subjoineryTypes ?? []).find(
			(item) => item.id === changedData.sub_joinery_type_id,
		),
		wood_mechanical_properties:
			changedData.wood_mechanical_properties as SpecimenPublic["wood_mechanical_properties"],
		wood_type: changedData.wood_type as SpecimenPublic["wood_type"],
	};
}

function formatFieldValue(value: unknown, unit?: string) {
	const text = renderValue(value);
	return (
		<span className="font-medium">
			{text}
			{unit ? (
				<span className="ml-1 text-sm font-light text-muted-foreground">
					{unit}
				</span>
			) : null}
		</span>
	);
}

export function renderFailureModeValue(
	failureModes: SpecimenPublic["e_qualitative_failure_measure"] | undefined,
) {
	return <span className="font-medium">{renderValue(failureModes ?? [])}</span>;
}

export function SpecimenDiffFieldRow({
	label,
	oldValue,
	newValue,
	isChanged,
	unit,
	renderOldValue,
	renderNewValue,
}: {
	label: string;
	oldValue: unknown;
	newValue: unknown;
	isChanged: boolean;
	unit?: string;
	renderOldValue?: () => ReactNode;
	renderNewValue?: () => ReactNode;
}) {
	return (
		<div className="grid gap-1 rounded-md px-3 py-2">
			<span className="text-[10px] tracking-wide text-muted-foreground uppercase">
				{label}
			</span>
			{isChanged ? (
				<div className="grid min-w-0 gap-1">
					<div className="text-sm text-red-600 line-through decoration-red-400">
						{renderOldValue
							? renderOldValue()
							: formatFieldValue(oldValue, unit)}
					</div>
					<div className="text-sm text-green-700 dark:text-green-400">
						{renderNewValue
							? renderNewValue()
							: formatFieldValue(newValue, unit)}
					</div>
				</div>
			) : (
				<div className="min-w-0 text-sm">
					{renderNewValue ? renderNewValue() : formatFieldValue(newValue, unit)}
				</div>
			)}
		</div>
	);
}
