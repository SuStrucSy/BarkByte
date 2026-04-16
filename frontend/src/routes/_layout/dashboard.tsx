import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { MinusIcon, PlusIcon, RotateCcwIcon } from "lucide-react";
import {
	type PointerEvent as ReactPointerEvent,
	type ReactNode,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useFastenertypeGetFastenerTypes } from "@/api/endpoints/fastenertype/fastenertype";
import { specimensReadSpecimens } from "@/api/endpoints/specimens/specimens";
import type { SpecimenPublic, SpecimensReadSpecimensParams } from "@/api/model";
import joineryTypesReference from "@/assets/joineryTypes.svg";
import { ChartErrorBoundary } from "@/components/Charts/ChartErrorBoundary";
import { ExpandableChart } from "@/components/Charts/ExpandableChart";
import { BoxPlot } from "@/components/Dashboard/BoxPlot";
import {
	type BoxPlotChartType,
	BoxPlotOptionsToolbar,
} from "@/components/Dashboard/BoxPlotOptionsToolbar";
import { DemographyGrid } from "@/components/Dashboard/DemographyGrid";
import { PageLoading } from "@/components/Dashboard/PageLoading";
import { ScatterPlotD3 } from "@/components/Dashboard/ScatterPlot";
import { SpecimenReferenceSheet } from "@/components/Specimens/SpecimenReferenceSheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
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

const BOX_PLOT_LABELS = EXPERIMENTAL_KEYS.map((key) => ({
	key,
	label: getExperimentalLabel(key),
}));
const CHART_OPTIONS_CARD_CLASSNAME =
	"sticky top-0 z-30 col-span-1 w-full justify-self-center overflow-hidden lg:col-span-2 lg:max-w-7xl";
const MIN_REFERENCE_SCALE = 1;
const MAX_REFERENCE_SCALE = 3;
const REFERENCE_ZOOM_STEP = 0.25;

function getDefaultFastener(fastenerTypes: string[]) {
	return (
		fastenerTypes.find((fastener) => fastener.toLowerCase() === "screw") ||
		fastenerTypes.find((fastener) =>
			fastener.toLowerCase().includes("screw"),
		) ||
		fastenerTypes[0]
	);
}

function MetricScatterCard({
	title,
	description,
	pointCount,
	expandableTitle,
	chartName,
	children,
}: {
	title: string;
	description: string;
	pointCount: number;
	expandableTitle: string;
	chartName: string;
	children: ReactNode;
}) {
	return (
		<Card>
			<CardHeader className="pb-4">
				<CardTitle>{title}</CardTitle>
				<CardDescription>
					{description}
					{pointCount > 0 && (
						<span className="ml-2 text-xs">
							({pointCount.toLocaleString()} points)
						</span>
					)}
				</CardDescription>
				<CardAction>
					<ExpandableChart title={expandableTitle}>
						{() => children}
					</ExpandableChart>
				</CardAction>
			</CardHeader>
			<CardContent className="pb-4">
				<ChartErrorBoundary chartName={chartName}>
					{children}
				</ChartErrorBoundary>
			</CardContent>
		</Card>
	);
}

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

function JoineryReferenceViewer() {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [scale, setScale] = useState(MIN_REFERENCE_SCALE);
	const [offset, setOffset] = useState({ x: 0, y: 0 });
	const [bounds, setBounds] = useState({ x: 0, y: 0 });
	const [imageSize, setImageSize] = useState({ width: 1, height: 1 });
	const dragStateRef = useRef<{
		pointerId: number;
		startX: number;
		startY: number;
		originX: number;
		originY: number;
	} | null>(null);
	const [isDragging, setIsDragging] = useState(false);

	const resetView = useCallback(() => {
		setScale(MIN_REFERENCE_SCALE);
		setOffset({ x: 0, y: 0 });
	}, []);

	const clampOffset = useCallback(
		(nextOffset: { x: number; y: number }) => ({
			x: clamp(nextOffset.x, -bounds.x, bounds.x),
			y: clamp(nextOffset.y, -bounds.y, bounds.y),
		}),
		[bounds.x, bounds.y],
	);

	const updateBounds = useCallback(() => {
		const container = containerRef.current;
		if (!container) {
			return;
		}

		const containerWidth = container.clientWidth;
		const containerHeight = container.clientHeight;
		const imageRatio = imageSize.width / imageSize.height;
		const containerRatio = containerWidth / containerHeight;

		const baseWidth =
			imageRatio > containerRatio
				? containerWidth
				: containerHeight * imageRatio;
		const baseHeight =
			imageRatio > containerRatio
				? containerWidth / imageRatio
				: containerHeight;

		setBounds({
			x: Math.max(0, (baseWidth * scale - containerWidth) / 2),
			y: Math.max(0, (baseHeight * scale - containerHeight) / 2),
		});
	}, [imageSize.height, imageSize.width, scale]);

	useLayoutEffect(() => {
		updateBounds();
	}, [updateBounds]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) {
			return;
		}

		const resizeObserver = new ResizeObserver(() => {
			updateBounds();
		});

		resizeObserver.observe(container);

		return () => {
			resizeObserver.disconnect();
		};
	}, [updateBounds]);

	useEffect(() => {
		setOffset((currentOffset) => clampOffset(currentOffset));
	}, [clampOffset]);

	const applyZoom = useCallback(
		(delta: number) => {
			setScale((currentScale) => {
				const nextScale = clamp(
					currentScale + delta,
					MIN_REFERENCE_SCALE,
					MAX_REFERENCE_SCALE,
				);

				if (nextScale === MIN_REFERENCE_SCALE) {
					setOffset({ x: 0, y: 0 });
				}

				return nextScale;
			});
		},
		[],
	);

	const handlePointerDown = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			if (scale === MIN_REFERENCE_SCALE) {
				return;
			}

			dragStateRef.current = {
				pointerId: event.pointerId,
				startX: event.clientX,
				startY: event.clientY,
				originX: offset.x,
				originY: offset.y,
			};

			setIsDragging(true);
			event.currentTarget.setPointerCapture(event.pointerId);
		},
		[offset.x, offset.y, scale],
	);

	const handlePointerMove = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			const dragState = dragStateRef.current;
			if (!dragState || dragState.pointerId !== event.pointerId) {
				return;
			}

			const deltaX = event.clientX - dragState.startX;
			const deltaY = event.clientY - dragState.startY;

			setOffset(
				clampOffset({
					x: dragState.originX + deltaX,
					y: dragState.originY + deltaY,
				}),
			);
		},
		[clampOffset],
	);

	const handlePointerUp = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			if (dragStateRef.current?.pointerId !== event.pointerId) {
				return;
			}

			dragStateRef.current = null;
			setIsDragging(false);

			if (event.currentTarget.hasPointerCapture(event.pointerId)) {
				event.currentTarget.releasePointerCapture(event.pointerId);
			}
		},
		[],
	);

	return (
		<div className="flex flex-col gap-4 lg:flex-row lg:items-start">
			<div className="flex w-fit shrink-0 flex-row rounded-lg border border-border bg-background shadow-xs lg:flex-col">
				<Button
					variant="outline"
					size="icon"
					className="rounded-r-none border-0 border-r lg:rounded-b-none lg:rounded-r-md lg:border-r-0 lg:border-b"
					onClick={() => applyZoom(REFERENCE_ZOOM_STEP)}
					disabled={scale >= MAX_REFERENCE_SCALE}
					aria-label="Zoom in reference image"
				>
					<PlusIcon />
				</Button>
				<Button
					variant="outline"
					size="icon"
					className="rounded-none border-0 border-r lg:border-r-0 lg:border-b"
					onClick={() => applyZoom(-REFERENCE_ZOOM_STEP)}
					disabled={scale <= MIN_REFERENCE_SCALE}
					aria-label="Zoom out reference image"
				>
					<MinusIcon />
				</Button>
				<Button
					variant="outline"
					size="icon"
					className="rounded-l-none border-0 lg:rounded-t-none lg:rounded-l-md"
					onClick={resetView}
					disabled={
						scale === MIN_REFERENCE_SCALE && offset.x === 0 && offset.y === 0
					}
					aria-label="Reset reference image position"
				>
					<RotateCcwIcon />
				</Button>
			</div>

			<div
				ref={containerRef}
				className="relative flex min-h-[420px] flex-1 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-muted/20 p-4 select-none"
			>
				<div className="absolute right-4 top-4 rounded-md bg-background/90 px-2 py-1 text-xs text-muted-foreground shadow-sm">
					{Math.round(scale * 100)}%
				</div>
				<div
					className={`flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-white p-3 shadow-sm ${
						scale > MIN_REFERENCE_SCALE
							? isDragging
								? "cursor-grabbing"
								: "cursor-grab"
							: "cursor-default"
					}`}
					onPointerDown={handlePointerDown}
					onPointerMove={handlePointerMove}
					onPointerUp={handlePointerUp}
					onPointerCancel={handlePointerUp}
					onPointerLeave={handlePointerUp}
					role="presentation"
				>
					<img
						src={joineryTypesReference}
						alt="Reference sheet showing timber joinery and connection types"
						className="pointer-events-none h-auto max-h-[620px] w-full object-contain"
						style={{
							transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
							transformOrigin: "center center",
							transition: isDragging ? "none" : "transform 150ms ease-out",
						}}
						onLoad={(event) => {
							setImageSize({
								width: event.currentTarget.naturalWidth,
								height: event.currentTarget.naturalHeight,
							});
						}}
					/>
				</div>
			</div>
		</div>
	);
}

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
	const [chartOptionsHeight, setChartOptionsHeight] = useState(0);
	const chartOptionsStickyBottomGap = 8;
	const chartHeight = useChartHeight(280, 500);
	const [chartOptionsCardElement, setChartOptionsCardElement] =
		useState<HTMLDivElement | null>(null);

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

		const defaultFastener = getDefaultFastener(fastenerTypes);

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

	const selectedChartType: ChartTypeOption = mirrorPosition
		? "violin"
		: "boxplot";
	const selectedFastenerBadgeLabel = selectedFastener
		? `Fastener: ${selectedFastener}`
		: null;

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

	return (
		<div className="space-y-4">
			{/* Header */}
			<Card>
				<CardHeader>
					<CardTitle>Specimen Analysis Dashboard</CardTitle>
					<CardDescription className="flex flex-wrap items-center gap-1">
						This is the dashboard page, where key data is visualized through distributions and individual data points to provide a clear overview of trends and patterns. The visualizations are interactive, allowing users to explore, filter, and engage with the data for deeper insights. {" "}
					</CardDescription>
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

			<Card>
				<CardHeader className="pb-4">
					<CardTitle>Joinery Types Reference</CardTitle>
					<CardDescription>
						Quick visual guide to the timber joinery and connection details used
						throughout the specimen dataset.
					</CardDescription>
				</CardHeader>
				<CardContent className="pb-4">
					<JoineryReferenceViewer />
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{/* Stiffness vs Ductility */}
				<MetricScatterCard
					title="Stiffness vs Ductility"
					description="Analyzing structural performance metrics"
					pointCount={stiffnessDuctilityData.length}
					expandableTitle="Stiffness vs Ductility"
					chartName="Stiffness vs Ductility"
				>
					<ScatterPlotD3 {...stiffnessDuctilityProps} height={chartHeight} />
				</MetricScatterCard>

				{/* Stiffness vs Yield Force */}
				<MetricScatterCard
					title="Stiffness vs Yield Force"
					description="Stiffness-force relationship analysis"
					pointCount={stiffnessYieldData.length}
					expandableTitle="Stiffness vs Yield Force"
					chartName="Stiffness vs Yield Force"
				>
					<ScatterPlotD3 {...stiffnessYieldProps} height={chartHeight} />
				</MetricScatterCard>

				<div className="col-span-1 grid grid-cols-1 gap-4 lg:col-span-2 lg:grid-cols-2">
					{/* Chart Options */}
					<BoxPlotOptionsToolbar
						className={CHART_OPTIONS_CARD_CLASSNAME}
						containerRef={setChartOptionsCardElement}
						selectedChartType={selectedChartType}
						onChartTypeChange={(value: BoxPlotChartType) =>
							setMirrorPosition(value === "violin" ? 1 : 0)
						}
						fastenerTypes={fastenerTypes}
						selectedFastener={selectedFastener}
						onFastenerChange={setSelectedFastener}
					/>

					{/* Box plots */}
					{BOX_PLOT_LABELS.map((ylabel) => (
						<Card key={ylabel.key} className="col-span-1">
							<CardHeader className="pb-4">
								<CardTitle>Box Plot Distribution</CardTitle>
								<CardDescription>
									Summarizes the distribution of {ylabel.label} grouped by
									joinery type
									{selectedSpecimens.length > 0 && (
										<span className="ml-2 text-xs">
											({selectedSpecimens.length.toLocaleString()} specimens)
										</span>
									)}
								</CardDescription>
								{selectedFastenerBadgeLabel ? (
									<CardAction>
										<Badge className="border-[color:var(--failure-badge-border)] bg-[color:var(--failure-badge-bg)] text-[color:var(--failure-badge-text)]">
											{selectedFastenerBadgeLabel}
										</Badge>
									</CardAction>
								) : null}
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
					<div
						className="col-span-1 lg:col-span-2"
						style={{ height: chartOptionsSpacerHeight }}
					/>
				</div>

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
