import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useLayoutEffect, useState } from "react";
import { useFastenertypeGetFastenerTypes } from "@/api/endpoints/fastenertype/fastenertype";
import type { SpecimenPublic } from "@/api/model";
import joineryTypesReference from "@/assets/joineryTypes.webp";
import { BoxPlotCard } from "@/components/Common/BoxPlotCard";
import { ScatterPlotCard } from "@/components/Common/ScatterPlotCard";
import { ZoomableImageViewer } from "@/components/Common/ZoomableImageViewer";
import {
	type BoxPlotChartType,
	DashboardBoxPlotOptionsToolbar,
} from "@/components/Dashboard/DashboardBoxPlotOptionsToolbar";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { DonutCard } from "@/components/Dashboard/DonutCard";
import {
	useDashboardDerivedData,
	useDashboardSpecimenData,
} from "@/components/Dashboard/dashboard.data";
import {
	BOX_PLOT_LABELS,
	DONUT_CARD_CONFIGS,
} from "@/components/Dashboard/dashboard.utils";
import { ScatterPlotD3 } from "@/components/Dashboard/ScatterPlot";
import { SpecimenReferenceSheet } from "@/components/Specimens/SpecimenReferenceSheet";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useChartHeight } from "@/hooks/useChartHeight";

export const Route = createFileRoute("/_layout/dashboard")({
	staticData: {
		title: "Dashboard",
	},
	component: Dashboard,
});

const CHART_OPTIONS_CARD_CLASSNAME =
	"col-span-1 w-full justify-self-center overflow-hidden lg:sticky lg:top-0 lg:z-30 lg:col-span-2 lg:max-w-7xl";

function Dashboard() {
	const PAGE_SIZE = 1000;
	const chartOptionsStickyBottomGap = 8;

	const [selectedFastenerOverride, setSelectedFastenerOverride] = useState<
		string | null
	>(null);
	const [selectedChartType, setSelectedChartType] =
		useState<BoxPlotChartType>("boxplot");
	const [selectedSpecimen, setSelectedSpecimen] =
		useState<SpecimenPublic | null>(null);
	const [sheetOpen, setSheetOpen] = useState(false);
	const [chartOptionsHeight, setChartOptionsHeight] = useState(0);
	const [chartOptionsCardElement, setChartOptionsCardElement] =
		useState<HTMLDivElement | null>(null);

	const scatterChartHeight = useChartHeight(280, 500);

	const handlePointClick = useCallback((specimen: SpecimenPublic) => {
		setSelectedSpecimen(specimen);
		setSheetOpen(true);
	}, []);

	const {
		isLoading,
		isError,
		error,
		allSpecimens,
		totalCount,
		loadedCount,
		isLoadingAll,
	} = useDashboardSpecimenData(PAGE_SIZE);

	const { isLoading: isFastenerLoading, data: fastenerTypesData } =
		useFastenertypeGetFastenerTypes();

	const {
		fastenerTypes,
		selectedFastener,
		selectedSpecimens,
		stiffnessDuctilityData,
		stiffnessYieldData,
		selectedFastenerBadgeLabel,
	} = useDashboardDerivedData({
		allSpecimens,
		totalCount,
		fastenerTypesData,
		selectedFastenerOverride,
	});

	const loadingProgress =
		totalCount > 0 ? Math.round((loadedCount / totalCount) * 100) : 0;

	const stiffnessDuctilityProps = {
		data: stiffnessDuctilityData,
		fastenerTypesData,
		xKey: "e_stiffness",
		yKey: "e_ductility",
		xLabel: "Stiffness (Ks) [KN/mm]",
		yLabel: "Ductility",
		title: "Stiffness vs Ductility",
		onPointClick: handlePointClick,
	} as const;

	const stiffnessYieldProps = {
		data: stiffnessYieldData,
		fastenerTypesData,
		xKey: "e_stiffness",
		yKey: "e_yield_force",
		xLabel: "Stiffness (Ks) [KN/mm]",
		yLabel: "Yield Strength (Fy) [KN]",
		title: "Stiffness vs Yield Force",
		onPointClick: handlePointClick,
	} as const;
	const chartOptionsSpacerHeight = chartOptionsHeight
		? `${chartOptionsHeight + chartOptionsStickyBottomGap}px`
		: undefined;

	useLayoutEffect(() => {
		if (!chartOptionsCardElement) {
			return;
		}

		const updateHeight = () => {
			setChartOptionsHeight(chartOptionsCardElement.offsetHeight);
		};

		updateHeight();

		const resizeObserver = new ResizeObserver(() => {
			updateHeight();
		});

		resizeObserver.observe(chartOptionsCardElement);

		return () => {
			resizeObserver.disconnect();
		};
	}, [chartOptionsCardElement]);

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
				isLoadingAll={isLoadingAll}
				loadedCount={loadedCount}
				totalCount={totalCount}
				loadingProgress={loadingProgress}
			/>

			<Card className="py-0">
				<CardHeader className="p-6">
					<CardTitle>Joinery Types Reference</CardTitle>
					<CardDescription>
						Quick visual guide to the timber joinery and connection details used
						throughout the specimen dataset.
					</CardDescription>
				</CardHeader>
				<CardContent className="p-6 pt-0">
					<ZoomableImageViewer
						imageSrc={joineryTypesReference}
						alt="Reference sheet showing timber joinery and connection types"
					/>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
				<ScatterPlotCard
					title="Stiffness vs Ductility"
					description="Analyzing structural performance metrics"
					pointCount={stiffnessDuctilityData.length}
					expandableTitle="Stiffness vs Ductility"
					chartName="Stiffness vs Ductility"
					isLoading={isLoading || isFastenerLoading}
				>
					<ScatterPlotD3
						{...stiffnessDuctilityProps}
						height={scatterChartHeight}
					/>
				</ScatterPlotCard>

				<ScatterPlotCard
					title="Stiffness vs Yield Force"
					description="Stiffness-force relationship analysis"
					pointCount={stiffnessYieldData.length}
					expandableTitle="Stiffness vs Yield Force"
					chartName="Stiffness vs Yield Force"
					isLoading={isLoading || isFastenerLoading}
				>
					<ScatterPlotD3 {...stiffnessYieldProps} height={scatterChartHeight} />
				</ScatterPlotCard>

				<SpecimenReferenceSheet
					specimen={selectedSpecimen}
					open={sheetOpen}
					onOpenChange={setSheetOpen}
				/>

				<div className="col-span-1 grid grid-cols-1 gap-3 lg:col-span-2 lg:grid-cols-2">
					{/* Chart Options */}
					<DashboardBoxPlotOptionsToolbar
						className={CHART_OPTIONS_CARD_CLASSNAME}
						containerRef={setChartOptionsCardElement}
						selectedChartType={selectedChartType}
						onChartTypeChange={setSelectedChartType}
						fastenerTypes={fastenerTypes}
						selectedFastener={selectedFastener}
						onFastenerChange={(value) =>
							setSelectedFastenerOverride(value || null)
						}
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

					{/* Reserve grid space for the sticky box plot options toolbar on large screens. */}
					<div
						className="hidden col-span-1 lg:col-span-2 lg:block"
						style={{ height: chartOptionsSpacerHeight }}
					/>
				</div>

				<Separator className="col-span-1 lg:col-span-2" />
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
			</div>

			{isLoadingAll && (
				<div className="flex flex-col items-center gap-4">
					<Item variant="outline" className="w-full overflow-hidden">
						<ItemMedia className="shrink-0">
							<Spinner aria-hidden="true" />
						</ItemMedia>
						<ItemContent className="min-w-0">
							<ItemTitle className="truncate">
								Loading all specimens...
							</ItemTitle>
						</ItemContent>
						<ItemContent className="flex-none">
							<span
								className="text-sm tabular-nums whitespace-nowrap"
								aria-live="polite"
							>
								{loadedCount.toLocaleString()} / {totalCount.toLocaleString()}
							</span>
						</ItemContent>
					</Item>
				</div>
			)}
		</div>
	);
}
