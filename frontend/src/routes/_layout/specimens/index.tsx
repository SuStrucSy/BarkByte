import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import type { SpecimenPublic } from "@/api/model";
import { DataTableToolbar } from "@/components/Data-Table/DataTableToolbar";
import { SpecimensTableFooter } from "@/components/Data-Table/SpecimensTableFooter";
import { SpecimensTablePanel } from "@/components/Data-Table/SpecimensTablePanel";
import { SpecimenTableSideBar } from "@/components/Data-Table/SpecimenTableSideBar";
import {
	exportSpecimensToCsv,
	specimensSearchSchema,
} from "@/components/Data-Table/specimenTableUtils";
import type { SpecimensSearchUpdate } from "@/components/Data-Table/useSpecimensController";
import { useSpecimensTableModel } from "@/components/Data-Table/useSpecimensTableModel";

const TABLE_PANEL_HEIGHT = "flex-1 min-h-0";

export const Route = createFileRoute("/_layout/specimens/")({
	staticData: {
		title: "Specimens",
	},
	component: Specimens,
	validateSearch: (search) => specimensSearchSchema.parse(search),
});

function SpecimensTablePage() {
	const search = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });

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
	} = useSpecimensTableModel({
		search,
		replaceSearch,
	});

	const navigateToSpecimen = useCallback(
		(specimen: SpecimenPublic) => {
			navigate({
				to: "/specimens/$specimenId",
				params: { specimenId: specimen.id },
			});
		},
		[navigate],
	);

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
					specimens={specimens}
					onSelectSpecimen={navigateToSpecimen}
					onDownloadCsv={() => exportSpecimensToCsv(filteredRows)}
				/>

				<SpecimensTablePanel
					table={table}
					pagination={pagination}
					columnCount={columns.length}
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
	return <SpecimensTablePage />;
}
