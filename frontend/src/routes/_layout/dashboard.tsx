import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { useFastenertypeGetFastenerTypes } from "@/api/endpoints/fastenertype/fastenertype";
import type { SpecimenPublic } from "@/api/model";
import { BoxPlotCard } from "@/components/Common/BoxPlotCard";
import {
	type BoxPlotChartType,
	DashboardBoxPlotOptionsToolbar,
} from "@/components/Dashboard/DashboardBoxPlotOptionsToolbar";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { DashboardScatterPlots } from "@/components/Dashboard/DashboardScatterPlots";
import { DonutCard } from "@/components/Dashboard/DonutCard";
import {
	useDashboardDerivedData,
	useDashboardSpecimenData,
} from "@/components/Dashboard/dashboard.data";
import {
	BOX_PLOT_LABELS,
	DONUT_CARD_CONFIGS,
} from "@/components/Dashboard/dashboard.utils";
import { JoineryTypesReferenceCard } from "@/components/Dashboard/JoineryTypesReferenceCard";
import { SpecimenReferenceSheet } from "@/components/Specimens/SpecimenReferenceSheet";
import { useChartHeight } from "@/hooks/useChartHeight";

export const Route = createFileRoute("/_layout/dashboard")({
	staticData: {
		title: "Dashboard",
	},
	component: Dashboard,
});

function Dashboard() {
	const PAGE_SIZE = 1000;

	const [selectedFastenerType, setSelectedFastenerType] = useState<
		string | null
	>(null);
	const [selectedChartType, setSelectedChartType] =
		useState<BoxPlotChartType>("boxplot");
	const [selectedSpecimen, setSelectedSpecimen] =
		useState<SpecimenPublic | null>(null);
	const [sheetOpen, setSheetOpen] = useState(false);

	const scatterChartHeight = useChartHeight(280, 500);

	const handlePointClick = useCallback((specimen: SpecimenPublic) => {
		setSelectedSpecimen(specimen);
		setSheetOpen(true);
	}, []);

	const { isLoading, isError, error, allSpecimens, totalCount, loadedCount } =
		useDashboardSpecimenData(PAGE_SIZE);

	const { isLoading: isFastenerLoading, data: fastenerTypesData } =
		useFastenertypeGetFastenerTypes();

	const {
		fastenerTypes,
		selectedFastener,
		selectedSpecimens,
		stiffnessDuctilityData,
		stiffnessYieldData,
		selectedFastenerBadgeLabel,
		handleFastenerChange,
	} = useDashboardDerivedData({
		allSpecimens,
		totalCount,
		fastenerTypesData,
		selectedFastenerType,
		setSelectedFastenerType,
	});

	// Error state
	if (isError) {
		return (
			<div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
				<div className="text-lg font-semibold">
					Failed to load dashboard data
				</div>
				<div className="text-sm">{error?.message || "Unknown error"}</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3 p-4">
			<DashboardHeader
				isLoading={isLoading}
				loadedCount={loadedCount}
				totalCount={totalCount}
			/>

			<JoineryTypesReferenceCard />

			<div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
				<DashboardScatterPlots
					stiffnessDuctilityData={stiffnessDuctilityData}
					stiffnessYieldData={stiffnessYieldData}
					fastenerTypesData={fastenerTypesData}
					height={scatterChartHeight}
					onPointClick={handlePointClick}
					isLoading={isLoading || isFastenerLoading}
				/>

				<div className="col-span-1 grid grid-cols-1 gap-3 lg:col-span-2 lg:grid-cols-2">
					{/* Chart Options */}
					<DashboardBoxPlotOptionsToolbar
						selectedChartType={selectedChartType}
						onChartTypeChange={setSelectedChartType}
						fastenerTypes={fastenerTypes}
						selectedFastener={selectedFastener}
						onFastenerChange={handleFastenerChange}
						isLoading={isLoading || isFastenerLoading}
					/>

					{BOX_PLOT_LABELS.map((ylabel) => (
						<BoxPlotCard
							key={ylabel.key}
							title="Box Plot Distribution"
							description={`Summarizes the distribution of ${ylabel.label} grouped by joinery type`}
							badgeLabel={selectedFastenerBadgeLabel}
							data={selectedSpecimens}
							yKey={ylabel.key}
							chartType={selectedChartType}
							onPointClick={handlePointClick}
							isLoading={isLoading || isFastenerLoading}
						/>
					))}
				</div>

				{DONUT_CARD_CONFIGS.map((config) => (
					<DonutCard
						key={config.mode}
						title={config.title}
						description={config.description}
						specimens={allSpecimens}
						mode={config.mode}
						isLoading={isLoading || isFastenerLoading}
					/>
				))}

				<SpecimenReferenceSheet
					specimen={selectedSpecimen}
					open={sheetOpen}
					onOpenChange={setSheetOpen}
				/>
			</div>
		</div>
	);
}
