import { useMemo } from "react";
import { useFailuremodeGetModes } from "@/api/endpoints/failuremode/failuremode";
import { useFastenertypeGetFastenerTypes } from "@/api/endpoints/fastenertype/fastenertype";
import { useJoinerytypeGetJtypes } from "@/api/endpoints/joinerytype/joinerytype";
import { useLoadingdirectionGetLoadingDirections } from "@/api/endpoints/loadingdirection/loadingdirection";
import { useSubjoinerytypeGetSjtypes } from "@/api/endpoints/subjoinerytype/subjoinerytype";
import type { SpecimenPublic } from "@/api/model";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";
import { getDisplayText, humanizeLabel, renderValue } from "@/lib/utils";

type UseSpecimenPendingChangeDisplayParams = {
	currentValues: AddNewSpecimenFormValues;
	originalValues: AddNewSpecimenFormValues;
	specimen: SpecimenPublic;
};

const manualFieldLabels: Partial<
	Record<keyof AddNewSpecimenFormValues, string>
> = {
	e_qualitative_failure_measure: "QFM",
	e_qfm_description: "QFM Description",
	note: "Specimen Note",
	doi_id: "DOI",
	joinery_type_id: "Joinery Type",
	sub_joinery_type_id: "Sub Joinery Type",
	fastener_type_ids: "Fastener Types",
	loading_direction_ids: "Loading Directions",
};

function getFieldLabel(field: keyof AddNewSpecimenFormValues) {
	return manualFieldLabels[field] ?? humanizeLabel(field);
}

function formatSingleLookupValue(
	value: string | undefined,
	labelLookup: Map<string, string>,
) {
	return value
		? getDisplayText(labelLookup.get(value) ?? value, "Unnamed")
		: "—";
}

function formatMultiLookupValue(
	value: string[] | undefined,
	labelLookup: Map<string, string>,
) {
	return renderValue(
		(value ?? []).map((id) =>
			getDisplayText(labelLookup.get(id) ?? id, "Unnamed"),
		),
	);
}

function buildLabelLookup(items: Array<{ id?: string; label: string }>) {
	return new Map(
		items
			.filter((item): item is { id: string; label: string } => Boolean(item.id))
			.map((item) => [item.id, item.label]),
	);
}

export function useSpecimenPendingChangeDisplay({
	currentValues,
	originalValues,
	specimen,
}: UseSpecimenPendingChangeDisplayParams) {
	const { data: joineryData } = useJoinerytypeGetJtypes();
	const { data: subjoineryData } = useSubjoinerytypeGetSjtypes();
	const { data: fastenerData } = useFastenertypeGetFastenerTypes();
	const { data: loadingDirectionData } =
		useLoadingdirectionGetLoadingDirections();
	const { data: qfmData } = useFailuremodeGetModes(
		{
			connector: currentValues.connector,
			dowel: currentValues.dowel,
		},
		{
			query: {
				queryKey: [
					"editQfmTypes",
					currentValues.connector,
					currentValues.dowel,
				],
			},
		},
	);

	const originalQfmLookup = useMemo(
		() => buildLabelLookup(specimen.e_qualitative_failure_measure),
		[specimen.e_qualitative_failure_measure],
	);
	const currentQfmLookup = useMemo(
		() => buildLabelLookup(qfmData?.data ?? []),
		[qfmData?.data],
	);
	const joineryLookup = useMemo(
		() => buildLabelLookup(joineryData?.data ?? []),
		[joineryData?.data],
	);
	const subjoineryLookup = useMemo(
		() => buildLabelLookup(subjoineryData?.data ?? []),
		[subjoineryData?.data],
	);
	const fastenerLookup = useMemo(
		() => buildLabelLookup(fastenerData?.data ?? []),
		[fastenerData?.data],
	);
	const loadingDirectionLookup = useMemo(
		() => buildLabelLookup(loadingDirectionData?.data ?? []),
		[loadingDirectionData?.data],
	);

	const renderChangedFieldValue = (
		field: keyof AddNewSpecimenFormValues,
		values: AddNewSpecimenFormValues,
		qfmLookup: Map<string, string>,
	) => {
		if (field === "e_qualitative_failure_measure") {
			return formatMultiLookupValue(
				values.e_qualitative_failure_measure,
				qfmLookup,
			);
		}

		if (field === "joinery_type_id") {
			return formatSingleLookupValue(values.joinery_type_id, joineryLookup);
		}

		if (field === "sub_joinery_type_id") {
			return formatSingleLookupValue(
				values.sub_joinery_type_id,
				subjoineryLookup,
			);
		}

		if (field === "fastener_type_ids") {
			return formatMultiLookupValue(values.fastener_type_ids, fastenerLookup);
		}

		if (field === "loading_direction_ids") {
			return formatMultiLookupValue(
				values.loading_direction_ids,
				loadingDirectionLookup,
			);
		}

		return renderValue(values[field]);
	};

	return {
		getFieldLabel,
		renderCurrentValue: (field: keyof AddNewSpecimenFormValues) =>
			renderChangedFieldValue(field, currentValues, currentQfmLookup),
		renderOriginalValue: (field: keyof AddNewSpecimenFormValues) =>
			renderChangedFieldValue(field, originalValues, originalQfmLookup),
	};
}
