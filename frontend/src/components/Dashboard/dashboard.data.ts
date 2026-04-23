import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { specimensReadSpecimens } from "@/api/endpoints/specimens/specimens";
import type {
	FastenerTypes,
	SpecimenPublic,
	SpecimensReadSpecimensParams,
} from "@/api/model";
import { isNumericValue } from "@/lib/typeGuards";
import { groupSpecimensByFastener } from "@/lib/utils";
import { getDefaultFastener } from "./dashboard.utils";

export function useDashboardSpecimenData(pageSize: number) {
	const queryResult = useQuery({
		queryKey: ["specimens", "dashboard", pageSize],
		queryFn: async ({ signal }) => {
			const allSpecimens: SpecimenPublic[] = [];
			let totalCount = 0;
			let skip = 0;

			while (true) {
				const params: SpecimensReadSpecimensParams = {
					limit: pageSize,
					skip,
				};
				const result = await specimensReadSpecimens(params, signal);
				totalCount = result.count ?? totalCount;
				allSpecimens.push(...result.data);

				if (
					result.data.length < pageSize ||
					(totalCount > 0 && allSpecimens.length >= totalCount)
				) {
					break;
				}

				skip += pageSize;
			}

			return {
				allSpecimens,
				totalCount,
			};
		},
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});

	const allSpecimens = queryResult.data?.allSpecimens ?? [];
	const totalCount = queryResult.data?.totalCount ?? 0;
	const loadedCount = allSpecimens.length;

	return {
		...queryResult,
		allSpecimens,
		totalCount,
		loadedCount,
		isLoadingAll: queryResult.isPending,
	};
}

export function useDashboardDerivedData({
	allSpecimens,
	totalCount,
	fastenerTypesData,
	selectedFastenerOverride,
}: {
	allSpecimens: SpecimenPublic[];
	totalCount: number;
	fastenerTypesData: FastenerTypes | undefined;
	selectedFastenerOverride: string | null;
}) {
	const groupsByFastenerType = useMemo(
		() =>
			groupSpecimensByFastener(
				{ count: totalCount, data: allSpecimens },
				fastenerTypesData,
			),
		[allSpecimens, fastenerTypesData, totalCount],
	);

	const fastenerTypes = useMemo(
		() => Object.keys(groupsByFastenerType),
		[groupsByFastenerType],
	);

	const selectedFastener = useMemo(() => {
		if (
			selectedFastenerOverride &&
			fastenerTypes.includes(selectedFastenerOverride)
		) {
			return selectedFastenerOverride;
		}

		return getDefaultFastener(fastenerTypes) ?? "";
	}, [fastenerTypes, selectedFastenerOverride]);

	const selectedSpecimens = useMemo(
		() => groupsByFastenerType[selectedFastener] || [],
		[groupsByFastenerType, selectedFastener],
	);

	const stiffnessDuctilityData = useMemo(
		() =>
			allSpecimens.filter(
				(s) => isNumericValue(s.e_stiffness) && isNumericValue(s.e_ductility),
			),
		[allSpecimens],
	);

	const stiffnessYieldData = useMemo(
		() =>
			allSpecimens.filter(
				(s) => isNumericValue(s.e_stiffness) && isNumericValue(s.e_yield_force),
			),
		[allSpecimens],
	);

	const selectedFastenerBadgeLabel = selectedFastener
		? `Fastener: ${selectedFastener}`
		: null;

	return {
		fastenerTypes,
		selectedFastener,
		selectedSpecimens,
		stiffnessDuctilityData,
		stiffnessYieldData,
		selectedFastenerBadgeLabel,
	};
}
