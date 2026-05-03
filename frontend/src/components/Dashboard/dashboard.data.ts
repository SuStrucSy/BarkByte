import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useMemo } from "react";
import type { FastenerTypes, SpecimenPublic } from "@/api/model";
import { useAllSpecimens } from "@/components/Data-Table/useAllSpecimens";
import { isNumericValue } from "@/lib/typeGuards";
import { groupSpecimensByFastener } from "@/lib/utils";
import { getDefaultFastener } from "./dashboard.utils";

export function useDashboardSpecimenData() {
	const { specimens, ...queryResult } = useAllSpecimens();

	return {
		...queryResult,
		allSpecimens: specimens,
	};
}

export function useDashboardDerivedData({
	allSpecimens,
	totalCount,
	fastenerTypesData,
	selectedFastenerType,
	setSelectedFastenerType,
}: {
	allSpecimens: SpecimenPublic[];
	totalCount: number;
	fastenerTypesData: FastenerTypes | undefined;
	selectedFastenerType: string | null;
	setSelectedFastenerType: Dispatch<SetStateAction<string | null>>;
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
		if (selectedFastenerType && fastenerTypes.includes(selectedFastenerType)) {
			return selectedFastenerType;
		}

		return getDefaultFastener(fastenerTypes) ?? "";
	}, [fastenerTypes, selectedFastenerType]);

	useEffect(() => {
		const nextSelectedFastener = selectedFastener || null;
		if (nextSelectedFastener !== selectedFastenerType) {
			setSelectedFastenerType(nextSelectedFastener);
		}
	}, [selectedFastener, selectedFastenerType, setSelectedFastenerType]);

	const handleFastenerChange = useCallback(
		(value: string) => {
			const nextSelectedFastener = value || null;
			setSelectedFastenerType(nextSelectedFastener);
		},
		[setSelectedFastenerType],
	);

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
		handleFastenerChange,
	};
}
