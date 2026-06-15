import { type Control, useWatch } from "react-hook-form";
import { useFailuremodeGetModes } from "@/api/endpoints/failuremode/failuremode";
import type { FailureMode } from "@/api/model";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";

type UseSpecimenExperimentalOptionsArgs = {
	control: Control<AddNewSpecimenFormValues>;
	initialQFMOptions?: FailureMode[];
};

type QFMOption = FailureMode & { id: string; label: string };

const hasStringIdAndLabel = (item: FailureMode): item is QFMOption =>
	typeof item.id === "string" &&
	item.id.length > 0 &&
	typeof item.label === "string" &&
	item.label.length > 0;

const uniqueById = (items: FailureMode[]): QFMOption[] =>
	items
		.filter(hasStringIdAndLabel)
		.filter(
			(item, index, list) =>
				list.findIndex((candidate) => candidate.id === item.id) === index,
		);

export function useSpecimenExperimentalOptions({
	control,
	initialQFMOptions = [],
}: UseSpecimenExperimentalOptionsArgs) {
	const hasConnector = useWatch({
		control,
		name: "connector",
	});
	const hasDowel = useWatch({
		control,
		name: "dowel",
	});
	const { data: qfmData } = useFailuremodeGetModes(
		{ connector: hasConnector, dowel: hasDowel },
		{
			query: {
				enabled:
					typeof hasConnector === "boolean" && typeof hasDowel === "boolean",
			},
		},
	);

	return {
		qfmList: uniqueById([...initialQFMOptions, ...(qfmData?.data ?? [])]),
	};
}
