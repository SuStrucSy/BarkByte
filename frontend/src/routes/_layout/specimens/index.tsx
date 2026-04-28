import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	type ColumnDef,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useCallback, useMemo } from "react";
import { useSpecimensReadSpecimenFilterOptions } from "@/api/endpoints/specimens/specimens";
import type { SpecimenPublic } from "@/api/model";
import type { DataTableFilterField } from "@/components/Data-Table/DataTableFilterControls";
import { DataTableToolbar } from "@/components/Data-Table/DataTableToolbar";
import { SpecimensTableFooter } from "@/components/Data-Table/SpecimensTableFooter";
import { SpecimensTablePanel } from "@/components/Data-Table/SpecimensTablePanel";
import { SpecimenTableSideBar } from "@/components/Data-Table/SpecimenTableSideBar";
import { createColumns } from "@/components/Data-Table/specimenColumns";
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
	exportSpecimensToCsv,
	getNumberBounds,
	isNonEmptyString,
	specimensSearchSchema,
} from "@/components/Data-Table/specimenTableUtils";
import { useAllSpecimens } from "@/components/Data-Table/useAllSpecimens";
import { useSpecimenSearchFilterSync } from "@/components/Data-Table/useSpecimenSearchFilterSync";
import {
	type SpecimensSearchUpdate,
	useSpecimensController,
} from "@/components/Data-Table/useSpecimensController";

const TABLE_PANEL_HEIGHT = "flex-1 min-h-0";

export const Route = createFileRoute("/_layout/specimens/")({
	staticData: {
		title: "Specimens",
	},
	component: Specimens,
	validateSearch: (search) => specimensSearchSchema.parse(search),
});

function SpecimensKitTable() {
	const search = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });

	const { data, isLoading } = useAllSpecimens();
	const { data: filterOptionsData } = useSpecimensReadSpecimenFilterOptions();

	// Use the raw specimen rows directly; avoid user-profile enrichment on the client.
	const rows = useMemo<SpecimenRow[]>(() => data?.data ?? [], [data?.data]);

	// Unique reference IDs used as options in command search.
	const referenceOptions = useMemo(
		() =>
			Array.from(new Set(rows.map((row) => row.specimen_reference_id)))
				.filter(Boolean)
				.sort(),
		[rows],
	);

	// Build checkbox options per filter field from facet payload/static options.
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

	// All searchable command fields plus reference values.
	const fieldOptions = useMemo(
		() => ({
			reference: referenceOptions,
			...checkboxOptionsByField,
		}),
		[referenceOptions, checkboxOptionsByField],
	);

	// Compute min/max bounds for each slider field from current rows.
	const sliderBoundsByField = useMemo(() => {
		const entries = SLIDER_FILTER_CONFIG.map((config) => [
			config.field,
			getNumberBounds(rows.map((row) => config.getValue(row))),
		]);
		return Object.fromEntries(entries) as Record<SliderField, Bounds>;
	}, [rows]);

	// Default slider ranges initialized from computed bounds.
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

	const replaceSearch = useCallback(
		(nextSearch: SpecimensSearchUpdate) => {
			navigate({
				replace: true,
				search: nextSearch,
			});
		},
		[navigate],
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

	// Memoized table column definitions.
	const kitColumns = useMemo<ColumnDef<SpecimenPublic>[]>(
		() =>
			createColumns<SpecimenPublic>({
				onFailureModeClick: handleFailureModeClick,
			}),
		[handleFailureModeClick],
	);

	// Convert filter config + bounds/options into UI-ready filter field definitions.
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

	// Parse command-style tokens from search text, e.g. "field:value".
	const structuredFilters = useMemo(() => {
		if (!searchTerm.includes(":")) return [];
		return parseStructuredFilterQuery(searchTerm).filter(
			(clause) => clause.field in fieldOptions,
		);
	}, [searchTerm, fieldOptions]);

	// Hydrates sidebar checkbox state from the current command-search text.
	useSpecimenSearchFilterSync({
		searchField: "all",
		searchTerm,
		structuredFilters,
		checkboxOptionsByField,
		setSelectedFilters,
		setFailureModeFilterMode,
	});

	// Apply command/text search, checkbox filters, and slider ranges to produce visible rows.
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

	const navigateToSpecimen = useCallback(
		(specimen: SpecimenPublic) => {
			navigate({
				to: "/specimens/$specimenId",
				params: { specimenId: specimen.id },
			});
		},
		[navigate],
	);

	const table = useReactTable({
		data: filteredRows,
		columns: kitColumns,
		state: { pagination, sorting, columnVisibility },
		onPaginationChange: (updater) => {
			setPagination(updater);
		},
		onSortingChange: setSorting,
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	return (
		<div
			className={`flex w-full min-h-0 flex-1 flex-col gap-3 sm:flex-row md:grid md:grid-rows-[auto_minmax(0,1fr)_auto] md:gap-y-4 md:px-0 md:py-0 ${
				controlsOpen
					? "md:grid-cols-[minmax(0,1fr)_24rem] md:gap-x-5"
					: "md:grid-cols-[minmax(0,1fr)]"
			} ${TABLE_PANEL_HEIGHT}`}
		>
			<div className="flex w-full min-h-0 flex-1 flex-col md:contents">
				<DataTableToolbar
					className="md:col-span-full md:row-start-1 md:pb-1"
					viewOptionsClassName="hidden md:inline-flex"
					controlsToggleClassName="hidden md:inline-flex"
					table={table}
					totalRows={rows.length}
					filteredRows={filteredRows.length}
					controlsOpen={controlsOpen}
					hasActiveSidebarFilters={hasActiveSidebarFilters}
					onToggleControls={toggleControls}
					onResetColumns={resetColumns}
					specimens={data?.data}
					onSelectSpecimen={navigateToSpecimen}
					onDownloadCsv={() => exportSpecimensToCsv(filteredRows)}
				/>

				<SpecimensTablePanel
					table={table}
					pagination={pagination}
					columnCount={kitColumns.length}
					isLoading={isLoading}
					onRowClick={(row) => navigateToSpecimen(row.original)}
				/>

				<SpecimensTableFooter
					table={table}
					pagination={pagination}
					filteredRowCount={filteredRows.length}
					totalRowCount={rows.length}
					isLoading={isLoading}
				/>
			</div>

			{controlsOpen ? (
				<SpecimenTableSideBar
					className="hidden md:col-start-2 md:row-start-2 md:flex md:self-start md:max-w-[24rem]"
					isLoading={isLoading}
					onClearAll={clearAllFilters}
					hasActiveSidebarFilters={hasActiveSidebarFilters}
					fields={filterFields}
					selectedByField={selectedFilters}
					sliderValuesByField={sliderValuesByField}
					failureModeFilterMode={failureModeFilterMode}
					onToggleOption={handleToggleOption}
					onSliderChange={handleSliderChange}
					onFailureModeFilterModeChange={handleFailureModeFilterModeChange}
					onResetField={handleResetField}
				/>
			) : null}
		</div>
	);
}

function Specimens() {
	return <SpecimensKitTable />;
}
