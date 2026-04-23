import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { MinusIcon, PlusIcon, RotateCcwIcon } from "lucide-react";
import {
	type ReactNode,
	type PointerEvent as ReactPointerEvent,
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
import joineryTypesReference from "@/assets/joineryTypes.webp";
import { ChartErrorBoundary } from "@/components/Charts/ChartErrorBoundary";
import { ExpandableChart } from "@/components/Charts/ExpandableChart";
import { BoxPlot } from "@/components/Dashboard/BoxPlot";
import {
	type BoxPlotChartType,
	BoxPlotOptionsToolbar,
} from "@/components/Dashboard/BoxPlotOptionsToolbar";
import { DemographyGrid } from "@/components/Dashboard/DemographyGrid";
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
import { Skeleton } from "@/components/ui/skeleton";
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
	"col-span-1 w-full justify-self-center overflow-hidden lg:sticky lg:top-0 lg:z-30 lg:col-span-2 lg:max-w-7xl";
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
	isLoading = false,
	children,
}: {
	title: string;
	description: string;
	pointCount: number;
	expandableTitle: string;
	chartName: string;
	isLoading?: boolean;
	children: ReactNode;
}) {
	return (
		<Card>
			<CardHeader className="gap-y-2 pb-3 has-data-[slot=card-action]:grid-cols-1 lg:gap-y-1.5 lg:pb-4 lg:has-data-[slot=card-action]:grid-cols-[1fr_auto]">
				<CardTitle>{title}</CardTitle>
				<CardDescription className="col-start-1 row-start-2">
					{description}
					{pointCount > 0 && (
						<span className="ml-2 text-xs">
							({pointCount.toLocaleString()} points)
						</span>
					)}
				</CardDescription>
				<CardAction className="hidden lg:block">
					{isLoading ? (
						<Skeleton className="h-9 w-9 rounded-full" />
					) : (
						<ExpandableChart title={expandableTitle}>
							{() => children}
						</ExpandableChart>
					)}
				</CardAction>
			</CardHeader>
			<CardContent className="pb-4">
				{isLoading ? (
					<div className="space-y-4">
						<Skeleton className="h-[280px] w-full rounded-xl" />
						<div className="flex flex-wrap justify-center gap-3 pt-1">
							{["legend-1", "legend-2", "legend-3"].map((id) => (
								<div key={id} className="flex items-center gap-2">
									<Skeleton className="h-4 w-4 rounded-full" />
									<Skeleton className="h-4 w-24" />
								</div>
							))}
						</div>
					</div>
				) : (
					<ChartErrorBoundary chartName={chartName}>
						{children}
					</ChartErrorBoundary>
				)}
			</CardContent>
		</Card>
	);
}

function DashboardBoxPlotCard({
	title,
	description,
	badgeLabel,
	specimenCount,
	isLoading = false,
	children,
}: {
	title: string;
	description: string;
	badgeLabel: string | null;
	specimenCount: number;
	isLoading?: boolean;
	children: ReactNode;
}) {
	return (
		<Card className="col-span-1">
			<CardHeader className="grid-cols-1 gap-y-2 pb-4 has-data-[slot=card-action]:grid-cols-1 sm:gap-y-1.5">
				<div className="col-start-1 row-start-1 flex items-start justify-between gap-3">
					<CardTitle>{title}</CardTitle>
					{isLoading ? (
						<Skeleton className="h-6 w-32 rounded-full" />
					) : badgeLabel ? (
						<Badge className="border-[color:var(--failure-badge-border)] bg-[color:var(--failure-badge-bg)] text-[color:var(--failure-badge-text)]">
							{badgeLabel}
						</Badge>
					) : null}
				</div>
				<CardDescription className="col-start-1 row-start-2">
					{description}
					{!isLoading && specimenCount > 0 && (
						<span className="ml-2 text-xs">
							({specimenCount.toLocaleString()} specimens)
						</span>
					)}
				</CardDescription>
			</CardHeader>
			<CardContent className="min-w-0 pb-4">
				{isLoading ? (
					<div className="space-y-4">
						<Skeleton className="h-[280px] w-full rounded-xl" />
						<div className="flex justify-center gap-3">
							{["axis-1", "axis-2", "axis-3", "axis-4"].map((id) => (
								<Skeleton key={id} className="h-4 w-16" />
							))}
						</div>
					</div>
				) : (
					<ChartErrorBoundary chartName="Box Plot">
						{children}
					</ChartErrorBoundary>
				)}
			</CardContent>
			<CardFooter />
		</Card>
	);
}

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

function JoineryReferenceViewer() {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [isTouchScreen, setIsTouchScreen] = useState(false);
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

	useEffect(() => {
		const mediaQuery = window.matchMedia(
			"(pointer: coarse), (hover: none), (any-pointer: coarse)",
		);
		const updateTouchScreenState = () => {
			setIsTouchScreen(mediaQuery.matches);
		};

		updateTouchScreenState();
		mediaQuery.addEventListener("change", updateTouchScreenState);

		return () => {
			mediaQuery.removeEventListener("change", updateTouchScreenState);
		};
	}, []);

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

	const applyZoom = useCallback((delta: number) => {
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
	}, []);

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

	if (isTouchScreen) {
		return (
			<div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-muted/20 p-4">
				<div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-white p-3 shadow-sm">
					<img
						src={joineryTypesReference}
						alt="Reference sheet showing timber joinery and connection types"
						className="h-auto max-h-[620px] w-full object-contain"
						decoding="async"
					/>
				</div>
			</div>
		);
	}

	return (
		<div
			ref={containerRef}
			className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-muted/20 p-4 select-none"
		>
			<div
				className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-white p-3 shadow-sm ${
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
				<div
					className="absolute left-4 top-4 z-10 flex flex-col rounded-lg border border-border bg-background/90 shadow-xs backdrop-blur-sm"
					onPointerDown={(event) => {
						event.stopPropagation();
					}}
				>
					<Button
						variant="outline"
						size="icon"
						className="rounded-b-none border-0 border-b bg-transparent"
						onClick={() => applyZoom(REFERENCE_ZOOM_STEP)}
						disabled={scale >= MAX_REFERENCE_SCALE}
						aria-label="Zoom in reference image"
					>
						<PlusIcon />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="rounded-none border-0 border-b bg-transparent"
						onClick={() => applyZoom(-REFERENCE_ZOOM_STEP)}
						disabled={scale <= MIN_REFERENCE_SCALE}
						aria-label="Zoom out reference image"
					>
						<MinusIcon />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="rounded-t-none border-0 bg-transparent"
						onClick={resetView}
						disabled={
							scale === MIN_REFERENCE_SCALE && offset.x === 0 && offset.y === 0
						}
						aria-label="Reset reference image position"
					>
						<RotateCcwIcon />
					</Button>
				</div>
				<div className="absolute right-4 top-4 z-10 rounded-md bg-background/90 px-2 py-1 text-xs text-muted-foreground shadow-sm">
					{Math.round(scale * 100)}%
				</div>
				<img
					src={joineryTypesReference}
					alt="Reference sheet showing timber joinery and connection types"
					className="pointer-events-none h-auto max-h-[620px] w-full object-contain"
					decoding="async"
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
	);
}

function useSpecimenData(pageSize: number) {
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

function Dashboard() {
	const PAGE_SIZE = 1000;
	const [selectedFastenerOverride, setSelectedFastenerOverride] = useState<
		string | null
	>(null);
	const [selectedChartType, setSelectedChartType] =
		useState<BoxPlotChartType>("boxplot");
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

	const mirrorPosition = selectedChartType === "violin" ? 1 : 0;
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
			{/* Header */}
			<Card className="py-0">
				<CardHeader className="p-6">
					<CardTitle>Specimen Analysis Dashboard</CardTitle>
					<CardDescription className="flex flex-wrap items-center gap-1">
						This is the dashboard page, where key data is visualized through
						distributions and individual data points to provide a clear overview
						of trends and patterns. The visualizations are interactive, allowing
						users to explore, filter, and engage with the data for deeper
						insights.{" "}
					</CardDescription>
					<CardDescription className="flex flex-wrap items-center gap-1">
						{isLoading ? (
							<>
								<Skeleton className="h-5 w-28" />
								<Skeleton className="h-6 w-28 rounded-full" />
							</>
						) : (
							<>
								{loadedCount.toLocaleString()} / {totalCount.toLocaleString()}{" "}
								specimens
							</>
						)}
						{!isLoading &&
							(isLoadingAll ? (
								<Badge
									variant="secondary"
									className="animate-pulse"
									aria-live="polite"
								>
									Loading... {loadingProgress}%
								</Badge>
							) : (
								<Badge aria-label="All specimens loaded">✓ Complete</Badge>
							))}
					</CardDescription>
				</CardHeader>
			</Card>

			<Card className="py-0">
				<CardHeader className="p-6">
					<CardTitle>Joinery Types Reference</CardTitle>
					<CardDescription>
						Quick visual guide to the timber joinery and connection details used
						throughout the specimen dataset.
					</CardDescription>
				</CardHeader>
				<CardContent className="p-6 pt-0">
					<JoineryReferenceViewer />
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
				{/* Stiffness vs Ductility */}
				<MetricScatterCard
					title="Stiffness vs Ductility"
					description="Analyzing structural performance metrics"
					pointCount={stiffnessDuctilityData.length}
					expandableTitle="Stiffness vs Ductility"
					chartName="Stiffness vs Ductility"
					isLoading={isLoading || isFastenerLoading}
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
					isLoading={isLoading || isFastenerLoading}
				>
					<ScatterPlotD3 {...stiffnessYieldProps} height={chartHeight} />
				</MetricScatterCard>

				<div className="col-span-1 grid grid-cols-1 gap-3 lg:col-span-2 lg:grid-cols-2">
					{/* Chart Options */}
					<BoxPlotOptionsToolbar
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

					{/* Box plots */}
					{BOX_PLOT_LABELS.map((ylabel) => (
						<DashboardBoxPlotCard
							key={ylabel.key}
							title="Box Plot Distribution"
							description={`Summarizes the distribution of ${ylabel.label} grouped by joinery type`}
							badgeLabel={selectedFastenerBadgeLabel}
							specimenCount={selectedSpecimens.length}
							isLoading={isLoading || isFastenerLoading}
						>
							<BoxPlot
								selectedSpecimens={selectedSpecimens}
								yKey={ylabel.key}
								yLabel={getFullLabel(ylabel.key)}
								height={chartHeight}
								mirrorPosition={mirrorPosition}
								onPointClick={handlePointClick}
							/>
						</DashboardBoxPlotCard>
					))}
					<div
						className="hidden col-span-1 lg:col-span-2 lg:block"
						style={{ height: chartOptionsSpacerHeight }}
					/>
				</div>

				<Separator className="col-span-1 lg:col-span-2" />
				<DemographyGrid
					specimens={allSpecimens}
					isLoading={isLoading || isFastenerLoading}
				/>
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
