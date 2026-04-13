import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CandlestickChartIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFastenertypeGetFastenerTypes } from "@/api/endpoints/fastenertype/fastenertype";
import { specimensReadSpecimens } from "@/api/endpoints/specimens/specimens";
import type { SpecimenPublic, SpecimensReadSpecimensParams } from "@/api/model";
import { ChartErrorBoundary } from "@/components/Charts/ChartErrorBoundary";
import { ExpandableChart } from "@/components/Charts/ExpandableChart";
import { BoxPlot } from "@/components/Dashboard/BoxPlot";
import { DemographyGrid } from "@/components/Dashboard/DemographyGrid";
import { PageLoading } from "@/components/Dashboard/PageLoading";
import { ScatterPlotD3 } from "@/components/Dashboard/ScatterPlot";
import { SpecimenReferenceSheet } from "@/components/Specimens/SpecimenReferenceSheet";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Toggle } from "@/components/ui/toggle";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChartHeight } from "@/hooks/useChartHeight";
import {
	EXPERIMENTAL_KEYS,
	getExperimentalLabel,
	getFullLabel,
} from "@/lib/constants";
import { isNumericValue } from "@/lib/typeGuards";
import { groupSpecimensByFastener } from "@/lib/utils";

export const Route = createFileRoute("/_layout/dashboard")({
	staticData: {
		title: "Dashboard",
	},
	component: Dashboard,
});

// Hook for managing infinite query with better tracking
function useSpecimenData(pageSize: number) {
	const queryResult = useInfiniteQuery({
		queryKey: ["specimens", "dashboard"],
		queryFn: async ({ pageParam = 0 }) => {
			const params: SpecimensReadSpecimensParams = {
				limit: pageSize,
				skip: pageParam,
			};
			const result = await specimensReadSpecimens(params);

			return result;
		},
		initialPageParam: 0,
		getNextPageParam: (lastPage, pages) => {
			const specimens = lastPage.data;
			return specimens.length === pageSize
				? pages.length * pageSize
				: undefined;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
	});

	const pages = queryResult.data?.pages ?? [];
	const allSpecimens = pages.flatMap((page) => page.data);
	const totalCount = pages[0]?.count ?? 0;
	const loadedCount = allSpecimens.length;
	const isLoadingAll =
		queryResult.hasNextPage || queryResult.isFetchingNextPage;

	return {
		...queryResult,
		allSpecimens,
		totalCount,
		loadedCount,
		isLoadingAll,
	};
}

function Dashboard() {
	const PAGE_SIZE = 1000;
	const [selectedFastener, setSelectedFastener] = useState<string>("");
	const [mirrorPosition, setMirrorPosition] = useState(0);
	const [selectedSpecimen, setSelectedSpecimen] =
		useState<SpecimenPublic | null>(null);
	const [sheetOpen, setSheetOpen] = useState(false);
	const chartHeight = useChartHeight(280, 500);

	const handlePointClick = useCallback((specimen: SpecimenPublic) => {
		setSelectedSpecimen(specimen);
		setSheetOpen(true);
	}, []);

	const {
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
		error,
		allSpecimens,
		totalCount,
		loadedCount,
		isLoadingAll,
	} = useSpecimenData(PAGE_SIZE);

	const { isLoading: isFastenerLoading, data: fastenerTypesData } =
		useFastenertypeGetFastenerTypes();

	// Auto-fetch all pages
	useEffect(() => {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	// Group specimens by fastener type - only recompute when data changes
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

	useEffect(() => {
		if (selectedFastener || fastenerTypes.length === 0) {
			return;
		}

		const defaultFastener =
			fastenerTypes.find((fastener) => fastener.toLowerCase() === "screw") ||
			fastenerTypes.find((fastener) =>
				fastener.toLowerCase().includes("screw"),
			) ||
			fastenerTypes[0];

		if (defaultFastener) {
			setSelectedFastener(defaultFastener);
		}
	}, [fastenerTypes, selectedFastener]);

	const selectedSpecimens = useMemo(
		() => groupsByFastenerType[selectedFastener] || [],
		[groupsByFastenerType, selectedFastener],
	);

	// Filter specimens with valid data for each chart
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

	// Loading state
	if (isLoading || isFastenerLoading) {
		return <PageLoading />;
	}

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

	const yLabels = EXPERIMENTAL_KEYS.map((key) => ({
		key,
		label: getExperimentalLabel(key),
	}));

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

	return (
		<div className="space-y-4">
			{/* Header */}
			<Card>
				<CardHeader>
					<CardTitle>Specimen Analysis Dashboard</CardTitle>
					<CardDescription className="flex flex-wrap items-center gap-1">
						{loadedCount.toLocaleString()} / {totalCount.toLocaleString()}{" "}
						specimens
						{isLoadingAll ? (
							<Badge
								variant="secondary"
								className="animate-pulse"
								aria-live="polite"
							>
								Loading... {loadingProgress}%
							</Badge>
						) : (
							<Badge aria-label="All specimens loaded">✓ Complete</Badge>
						)}
					</CardDescription>
				</CardHeader>
			</Card>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{/* Stiffness vs Ductility */}
				<Card>
					<CardHeader className="pb-4">
						<CardTitle>Stiffness vs Ductility</CardTitle>
						<CardDescription>
							Analyzing structural performance metrics
							{stiffnessDuctilityData.length > 0 && (
								<span className="ml-2 text-xs">
									({stiffnessDuctilityData.length.toLocaleString()} points)
								</span>
							)}
						</CardDescription>
						<CardAction>
							<ExpandableChart title="Stiffness vs Ductility">
								{() => <ScatterPlotD3 {...stiffnessDuctilityProps} />}
							</ExpandableChart>
						</CardAction>
					</CardHeader>
					<CardContent className="pb-4">
						<ChartErrorBoundary chartName="Stiffness vs Ductility">
							<ScatterPlotD3
								{...stiffnessDuctilityProps}
								height={chartHeight}
							/>
						</ChartErrorBoundary>
					</CardContent>
				</Card>

				{/* Stiffness vs Yield Force */}
				<Card>
					<CardHeader className="pb-4">
						<CardTitle>Stiffness vs Yield Force</CardTitle>
						<CardDescription>
							Stiffness-force relationship analysis
							{stiffnessYieldData.length > 0 && (
								<span className="ml-2 text-xs">
									({stiffnessYieldData.length.toLocaleString()} points)
								</span>
							)}
						</CardDescription>
						<CardAction>
							<ExpandableChart title="Stiffness vs Yield Force">
								{() => <ScatterPlotD3 {...stiffnessYieldProps} />}
							</ExpandableChart>
						</CardAction>
					</CardHeader>
					<CardContent className="pb-4">
						<ChartErrorBoundary chartName="Stiffness vs Yield Force">
							<ScatterPlotD3 {...stiffnessYieldProps} height={chartHeight} />
						</ChartErrorBoundary>
					</CardContent>
				</Card>

				{/* Chart Options */}
				<Card className="col-span-1 lg:col-span-2">
					<CardHeader>
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
							<div>
								<CardTitle>Chart Options</CardTitle>
								<CardDescription className="mt-1">
									<Tooltip>
										<TooltipTrigger asChild>
											<Toggle
												aria-label="Toggle violin plot"
												variant="outline"
												onPressedChange={(pressed) =>
													setMirrorPosition(pressed ? 1 : 0)
												}
											>
												<CandlestickChartIcon className="group-data-[state=on]/toggle:fill-foreground" />
												{mirrorPosition ? "Violin" : "Boxplot"}
											</Toggle>
										</TooltipTrigger>
										<TooltipContent>
											<p>Toggle between boxplot and violin plot</p>
										</TooltipContent>
									</Tooltip>
								</CardDescription>
							</div>
							<Select
								onValueChange={setSelectedFastener}
								value={selectedFastener}
							>
								<SelectTrigger
									className="w-full sm:w-48"
									aria-label="Select fastener type"
								>
									<SelectValue placeholder="Select a fastener" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectLabel>Fastener</SelectLabel>
										{fastenerTypes.map((fastener) => (
											<SelectItem key={fastener} value={fastener}>
												{fastener}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>
					</CardHeader>
				</Card>

				{/* Box plots */}
				{yLabels.map((ylabel) => (
					<Card
						key={ylabel.key}
						className="col-span-1 lg:last:col-span-2 lg:odd:last-of-type:col-span-2"
					>
						<CardHeader className="pb-4">
							<CardTitle>Box Plot Distribution</CardTitle>
							<CardDescription>
								Summarizes the distribution of {ylabel.label} grouped by joinery
								type
								{selectedSpecimens.length > 0 && (
									<span className="ml-2 text-xs">
										({selectedSpecimens.length.toLocaleString()} specimens)
									</span>
								)}
							</CardDescription>
						</CardHeader>
						<CardContent className="pb-4 min-w-0">
							<ChartErrorBoundary chartName="Box Plot">
								<BoxPlot
									selectedSpecimens={selectedSpecimens}
									yKey={ylabel.key}
									yLabel={getFullLabel(ylabel.key)}
									mirrorPosition={mirrorPosition}
									onPointClick={handlePointClick}
								/>
							</ChartErrorBoundary>
						</CardContent>
						<CardFooter />
					</Card>
				))}

				<Separator className="col-span-1 lg:col-span-2" />
				<DemographyGrid specimens={allSpecimens} />
			</div>

			{selectedSpecimen && (
				<SpecimenReferenceSheet
					specimen={selectedSpecimen}
					open={sheetOpen}
					onOpenChange={setSheetOpen}
				/>
			)}

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
