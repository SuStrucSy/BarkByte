import { type Control, useWatch } from "react-hook-form";
import { useFastenertypeGetFastenerTypes } from "@/api/endpoints/fastenertype/fastenertype";
import { useJoinerytypeGetJtypes } from "@/api/endpoints/joinerytype/joinerytype";
import { useLoadingdirectionGetLoadingDirections } from "@/api/endpoints/loadingdirection/loadingdirection";
import { useSubjoinerytypeGetSjtypesForJtype } from "@/api/endpoints/subjoinerytype/subjoinerytype";
import type {
	FastenerType,
	JoineryType,
	LoadingDirection,
	SubJoineryType,
} from "@/api/model";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";

type UseSpecimenDetailsOptionsArgs = {
	control: Control<AddNewSpecimenFormValues>;
	initialJoineryOptions?: JoineryType[];
	initialSubJoineryOptions?: SubJoineryType[];
	initialFastenerOptions?: FastenerType[];
	initialLoadingDirectionOptions?: LoadingDirection[];
};

type OptionWithId<TItem extends { id?: string }> = TItem & { id: string };

const hasStringId = <TItem extends { id?: string }>(
	item: TItem,
): item is OptionWithId<TItem> =>
	typeof item.id === "string" && item.id.length > 0;

const uniqueById = <TItem extends { id?: string }>(
	items: TItem[],
): Array<OptionWithId<TItem>> =>
	items
		.filter(hasStringId)
		.filter(
			(item, index, list) =>
				list.findIndex((candidate) => candidate.id === item.id) === index,
		);

export function useSpecimenDetailsOptions({
	control,
	initialJoineryOptions = [],
	initialSubJoineryOptions = [],
	initialFastenerOptions = [],
	initialLoadingDirectionOptions = [],
}: UseSpecimenDetailsOptionsArgs) {
	const selectedJoineryTypeId = useWatch({
		control,
		name: "joinery_type_id",
	});

	const { data: joineryData } = useJoinerytypeGetJtypes();
	const { data: subjoineryData } = useSubjoinerytypeGetSjtypesForJtype(
		selectedJoineryTypeId,
	);
	const { data: fastenerData, refetch: refetchFasteners } =
		useFastenertypeGetFastenerTypes();
	const { data: loadingDirectionData } =
		useLoadingdirectionGetLoadingDirections();

	return {
		selectedJoineryTypeId,
		joineryTypeList: uniqueById([
			...initialJoineryOptions,
			...(joineryData?.data ?? []),
		]),
		subJoineryTypeList: uniqueById([
			...initialSubJoineryOptions,
			...(subjoineryData?.data ?? []),
		]),
		fastenerTypeList: uniqueById([
			...initialFastenerOptions,
			...(fastenerData?.data ?? []),
		]),
		loadingDirectionList: uniqueById([
			...initialLoadingDirectionOptions,
			...(loadingDirectionData?.data ?? []),
		]),
		hasFetchedFastenerTypes: Boolean(fastenerData?.data?.length),
		refetchFasteners,
	};
}
