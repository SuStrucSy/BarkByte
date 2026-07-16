import { useMemo } from "react";
import { useFailuremodeGetModes } from "@/api/endpoints/failuremode/failuremode";
import { useFastenertypeGetFastenerTypes } from "@/api/endpoints/fastenertype/fastenertype";
import { useJoinerytypeGetJtypes } from "@/api/endpoints/joinerytype/joinerytype";
import { useLoadingdirectionGetLoadingDirections } from "@/api/endpoints/loadingdirection/loadingdirection";
import { useSpecimensReadSpecimens } from "@/api/endpoints/specimens/specimens";
import { useSubjoinerytypeGetSjtypes } from "@/api/endpoints/subjoinerytype/subjoinerytype";
import { FailureModesSection } from "./FailureModesSection";
import { FastenerTypesSection } from "./FastenerTypesSection";
import { JoineryTypesSection } from "./JoineryTypesSection";
import { LoadingDirectionsSection } from "./LoadingDirectionsSection";
import { LARGE_LIMIT, SPECIMEN_USAGE_LIMIT } from "./referenceDataConstants";
import { SubJoineryTypesSection } from "./SubJoineryTypesSection";

export default function ReferenceDataManager() {
	const failureModeParams = {
		dowel: true,
		connector: true,
		skip: 0,
		limit: LARGE_LIMIT,
	};

	const { data: failureModesResponse, isLoading: isFailureModesLoading } =
		useFailuremodeGetModes(failureModeParams);
	const { data: joineryTypesResponse, isLoading: isJoineryTypesLoading } =
		useJoinerytypeGetJtypes({ skip: 0, limit: LARGE_LIMIT });
	const { data: subJoineryTypesResponse, isLoading: isSubJoineryTypesLoading } =
		useSubjoinerytypeGetSjtypes({ skip: 0, limit: LARGE_LIMIT });
	const { data: fastenerTypesResponse, isLoading: isFastenerTypesLoading } =
		useFastenertypeGetFastenerTypes({ skip: 0, limit: LARGE_LIMIT });
	const {
		data: loadingDirectionsResponse,
		isLoading: isLoadingDirectionsLoading,
	} = useLoadingdirectionGetLoadingDirections({ skip: 0, limit: LARGE_LIMIT });
	const { data: specimensResponse, isLoading: isSpecimensLoading } =
		useSpecimensReadSpecimens({
			skip: 0,
			limit: SPECIMEN_USAGE_LIMIT,
		});

	const failureModes = useMemo(
		() =>
			(failureModesResponse?.data ?? [])
				.slice()
				.sort((left, right) => left.label.localeCompare(right.label)),
		[failureModesResponse],
	);
	const joineryTypes = useMemo(
		() =>
			(joineryTypesResponse?.data ?? [])
				.slice()
				.sort((left, right) => left.label.localeCompare(right.label)),
		[joineryTypesResponse],
	);
	const fastenerTypes = useMemo(
		() =>
			(fastenerTypesResponse?.data ?? [])
				.slice()
				.sort((left, right) => left.label.localeCompare(right.label)),
		[fastenerTypesResponse],
	);
	const loadingDirections = useMemo(
		() =>
			(loadingDirectionsResponse?.data ?? [])
				.slice()
				.sort((left, right) => left.label.localeCompare(right.label)),
		[loadingDirectionsResponse],
	);
	const specimenUsage = useMemo(() => {
		const joineryTypeIds = new Set<string>();
		const subJoineryTypeIds = new Set<string>();
		const fastenerTypeIds = new Set<string>();
		const loadingDirectionIds = new Set<string>();
		const failureModeIds = new Set<string>();

		for (const specimen of specimensResponse?.data ?? []) {
			if (specimen.joinery_type.id) {
				joineryTypeIds.add(specimen.joinery_type.id);
			}
			if (specimen.sub_joinery_type.id) {
				subJoineryTypeIds.add(specimen.sub_joinery_type.id);
			}

			for (const fastenerType of specimen.fastener_types) {
				if (fastenerType.id) {
					fastenerTypeIds.add(fastenerType.id);
				}
			}

			for (const loadingDirection of specimen.loading_directions) {
				if (loadingDirection.id) {
					loadingDirectionIds.add(loadingDirection.id);
				}
			}

			for (const failureMode of specimen.e_qualitative_failure_measure) {
				if (failureMode.id) {
					failureModeIds.add(failureMode.id);
				}
			}
		}

		return {
			joineryTypeIds,
			subJoineryTypeIds,
			fastenerTypeIds,
			loadingDirectionIds,
			failureModeIds,
			isComplete:
				(specimensResponse?.count ?? 0) <=
				(specimensResponse?.data.length ?? 0),
		};
	}, [specimensResponse]);

	const isDeleteCheckPending = isSpecimensLoading || !specimenUsage.isComplete;
	const getDeleteBlockedDescription = (label: string) =>
		isSpecimensLoading
			? `Delete is temporarily disabled while specimen usage is being checked for "${label}".`
			: `Cannot delete "${label}" because one or more specimens still use it.`;

	const joineryLabelById = useMemo(
		() =>
			new Map(joineryTypes.map((item) => [item.id ?? "", item.label] as const)),
		[joineryTypes],
	);
	const subJoineryTypes = useMemo(
		() =>
			(subJoineryTypesResponse?.data ?? []).slice().sort((left, right) => {
				const leftGroup = joineryLabelById.get(left.joinery_type_id) ?? "";
				const rightGroup = joineryLabelById.get(right.joinery_type_id) ?? "";
				return (
					leftGroup.localeCompare(rightGroup) ||
					left.label.localeCompare(right.label)
				);
			}),
		[subJoineryTypesResponse, joineryLabelById],
	);

	return (
		<div className="space-y-6">
			<FailureModesSection
				items={failureModes}
				isLoading={isFailureModesLoading}
				isDeleteCheckPending={isDeleteCheckPending}
				usedIds={specimenUsage.failureModeIds}
				getDeleteBlockedDescription={getDeleteBlockedDescription}
			/>

			<JoineryTypesSection
				items={joineryTypes}
				isLoading={isJoineryTypesLoading}
				isDeleteCheckPending={isDeleteCheckPending}
				usedIds={specimenUsage.joineryTypeIds}
				getDeleteBlockedDescription={getDeleteBlockedDescription}
			/>

			<SubJoineryTypesSection
				items={subJoineryTypes}
				joineryTypes={joineryTypes}
				joineryLabelById={joineryLabelById}
				isLoading={isSubJoineryTypesLoading}
				isJoineryTypesLoading={isJoineryTypesLoading}
				isDeleteCheckPending={isDeleteCheckPending}
				usedIds={specimenUsage.subJoineryTypeIds}
				getDeleteBlockedDescription={getDeleteBlockedDescription}
			/>

			<FastenerTypesSection
				items={fastenerTypes}
				isLoading={isFastenerTypesLoading}
				isDeleteCheckPending={isDeleteCheckPending}
				usedIds={specimenUsage.fastenerTypeIds}
				getDeleteBlockedDescription={getDeleteBlockedDescription}
			/>

			<LoadingDirectionsSection
				items={loadingDirections}
				isLoading={isLoadingDirectionsLoading}
				isDeleteCheckPending={isDeleteCheckPending}
				usedIds={specimenUsage.loadingDirectionIds}
				getDeleteBlockedDescription={getDeleteBlockedDescription}
			/>
		</div>
	);
}
