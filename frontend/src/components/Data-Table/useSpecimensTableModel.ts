import {
	type ColumnDef,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo } from "react";
import { useSpecimensReadSpecimenFilterOptions } from "@/api/endpoints/specimens/specimens";
import type { SpecimenPublic } from "@/api/model";
import type { DataTableFilterField } from "@/components/Data-Table/DataTableFilterControls";
import { createColumns } from "@/components/Data-Table/specimenColumns";
import { saveSpecimensTableSearch } from "@/components/Data-Table/specimensTableNavigation";
import {
	CHECKBOX_FILTER_CONFIG,
	type CheckboxField,
	filterSpecimenRows,
	isFacetField,
	parseStructuredFilterQuery,
	SLIDER_FILTER_CONFIG,
	type SliderField,
	type SpecimenRow,
} from "@/components/Data-Table/specimenTableFilters";
import {
	type Bounds,
	getNumberBounds,
	isNonEmptyString,
} from "@/components/Data-Table/specimenTableUtils";
import { useAllSpecimens } from "@/components/Data-Table/useAllSpecimens";
import { useSpecimenSearchFilterSync } from "@/components/Data-Table/useSpecimenSearchFilterSync";
import {
	type SpecimensSearchState,
	type SpecimensSearchUpdate,
	useSpecimensController,
} from "@/components/Data-Table/useSpecimensController";

interface UseSpecimensTableModelArgs {
	search: SpecimensSearchState;
	replaceSearch: (search: SpecimensSearchUpdate) => void;
}

export function useSpecimensTableModel({
	search,
	replaceSearch,
}: UseSpecimensTableModelArgs) {
	const { specimens, isLoading } = useAllSpecimens();
	const { data: filterOptionsData } = useSpecimensReadSpecimenFilterOptions();

	const rows = useMemo<SpecimenRow[]>(() => specimens, [specimens]);

	const referenceOptions = useMemo(
		() =>
			Array.from(new Set(rows.map((row) => row.specimen_reference_id)))
				.filter(Boolean)
				.sort(),
		[rows],
	);

	const checkboxOptionsByField = useMemo(() => {
		const entries = CHECKBOX_FILTER_CONFIG.map((config) => {
			if (config.options) {
				return [config.field, config.options] as const;
			}

			if (isFacetField(config.field)) {
				const facetOptions = (filterOptionsData?.[config.field] ?? [])
					.filter(isNonEmptyString)
					.slice()
					.sort();
				return [config.field, facetOptions] as const;
			}

			return [config.field, []] as const;
		});

		return Object.fromEntries(entries) as Record<CheckboxField, string[]>;
	}, [filterOptionsData]);

	const fieldOptions = useMemo(
		() => ({
			reference: referenceOptions,
			...checkboxOptionsByField,
		}),
		[referenceOptions, checkboxOptionsByField],
	);

	const sliderBoundsByField = useMemo(() => {
		const entries = SLIDER_FILTER_CONFIG.map((config) => [
			config.field,
			getNumberBounds(rows.map((row) => config.getValue(row))),
		]);
		return Object.fromEntries(entries) as Record<SliderField, Bounds>;
	}, [rows]);

	const sliderDefaults = useMemo(
		() =>
			Object.fromEntries(
				SLIDER_FILTER_CONFIG.map((config) => {
					const bounds = sliderBoundsByField[config.field];
					return [config.field, [bounds.min, bounds.max] as [number, number]];
				}),
			) as Record<SliderField, [number, number]>,
		[sliderBoundsByField],
	);

	const {
		clearAllFilters,
		columnVisibility,
		controlsOpen,
		failureModeFilterMode,
		handleFailureModeClick,
		handleFailureModeFilterModeChange,
		handleResetField,
		handleSliderChange,
		handleToggleOption,
		hasActiveSidebarFilters,
		pagination,
		resetColumns,
		searchTerm,
		setColumnVisibility,
		selectedFilters,
		setFailureModeFilterMode,
		setPagination,
		setSelectedFilters,
		setSorting,
		sliderValuesByField,
		sorting,
		toggleControls,
	} = useSpecimensController({
		search,
		sliderDefaults,
		replaceSearch,
	});

	useEffect(() => {
		saveSpecimensTableSearch(search);
	}, [search]);

	const columns = useMemo<ColumnDef<SpecimenPublic>[]>(
		() =>
			createColumns<SpecimenPublic>({
				onFailureModeClick: handleFailureModeClick,
			}),
		[handleFailureModeClick],
	);

	const filterFields = useMemo<DataTableFilterField[]>(
		() => [
			...CHECKBOX_FILTER_CONFIG.map((config) => ({
				type: "checkbox" as const,
				value: config.field,
				label: config.label,
				options: checkboxOptionsByField[config.field],
			})),
			...SLIDER_FILTER_CONFIG.map((config) => {
				const bounds = sliderBoundsByField[config.field];
				return {
					type: "slider" as const,
					value: config.field,
					label: config.label,
					min: bounds.min,
					max: bounds.max,
					step: config.step,
				};
			}),
		],
		[checkboxOptionsByField, sliderBoundsByField],
	);

	const structuredFilters = useMemo(() => {
		if (!searchTerm.includes(":")) return [];
		return parseStructuredFilterQuery(searchTerm).filter(
			(clause) => clause.field in fieldOptions,
		);
	}, [searchTerm, fieldOptions]);

	useSpecimenSearchFilterSync({
		searchField: "all",
		searchTerm,
		structuredFilters,
		checkboxOptionsByField,
		setSelectedFilters,
		setFailureModeFilterMode,
	});

	const filteredRows = useMemo(
		() =>
			filterSpecimenRows({
				rows,
				searchTerm,
				searchField: "all",
				structuredFilters,
				selectedFilters,
				failureModeFilterMode,
				sliderValuesByField,
				sliderDefaults,
			}),
		[
			rows,
			searchTerm,
			structuredFilters,
			selectedFilters,
			failureModeFilterMode,
			sliderValuesByField,
			sliderDefaults,
		],
	);

	const handlePaginationChange = useCallback(
		(updater: Parameters<typeof setPagination>[0]) => {
			setPagination(updater);
		},
		[setPagination],
	);

	const table = useReactTable({
		data: filteredRows,
		columns,
		state: { pagination, sorting, columnVisibility },
		onPaginationChange: handlePaginationChange,
		onSortingChange: setSorting,
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	return {
		clearAllFilters,
		columns,
		controlsOpen,
		failureModeFilterMode,
		filteredRows,
		filterFields,
		handleFailureModeFilterModeChange,
		handleResetField,
		handleSliderChange,
		handleToggleOption,
		hasActiveSidebarFilters,
		isLoading,
		pagination,
		resetColumns,
		rows,
		selectedFilters,
		sliderValuesByField,
		specimens,
		table,
		toggleControls,
	};
}
