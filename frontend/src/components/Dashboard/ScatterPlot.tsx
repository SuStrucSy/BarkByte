import * as d3 from "d3";
import { RotateCcwIcon, ZoomInIcon } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FastenerTypes, SpecimenPublic } from "@/api/model";
import {
	CHART_CONFIG,
	SHAPE_GENERATORS,
	SHAPES,
} from "@/components/Charts/chartConfig";
import { Button } from "@/components/ui/button";
import { isNumericValue } from "@/lib/typeGuards";
import { getChartColors, groupSpecimensByFastener } from "@/lib/utils";

interface ScatterPlotD3Props {
	data: SpecimenPublic[];
	fastenerTypesData: FastenerTypes | undefined;
	xKey: keyof SpecimenPublic;
	yKey: keyof SpecimenPublic;
	xLabel: string;
	yLabel: string;
	height?: number;
	isExpanded?: boolean;
	title?: string;
	onPointClick?: (specimen: SpecimenPublic) => void;
}

interface ZoomExtent {
	x: [number, number];
	y: [number, number];
}

interface GroupedDataItem {
	groupName: string;
	specimens: SpecimenPublic[];
	color: string;
	shape: keyof typeof SHAPE_GENERATORS;
}

const Legend = memo(({ groupedData }: { groupedData: GroupedDataItem[] }) => (
	<div className="flex flex-wrap justify-center gap-x-3 gap-y-2 pt-1 sm:gap-x-4 sm:gap-y-3 sm:pt-2">
		{groupedData.map((group) => (
			<div
				key={group.groupName}
				className="flex items-center gap-1.5 px-0.5 text-xs sm:gap-2 sm:px-1 sm:text-sm"
			>
				<svg
					width="18"
					height="18"
					aria-hidden="true"
					className="sm:h-5 sm:w-5"
				>
					<path
						d={SHAPE_GENERATORS[group.shape](6) || undefined}
						transform="translate(9,9)"
						fill={group.color}
						fillOpacity={0.6}
						stroke={group.color}
						strokeWidth={1}
					/>
				</svg>
				<span>{group.groupName}</span>
			</div>
		))}
	</div>
));
Legend.displayName = "Legend";

const ScatterTooltip = memo(
	({
		hoveredPoint,
		tooltipPos,
		dimensions,
		xLabel,
		yLabel,
		xKey,
		yKey,
		onPointClick,
		tooltipRef,
		onTooltipLeave,
	}: {
		hoveredPoint: SpecimenPublic;
		tooltipPos: { x: number; y: number };
		dimensions: { width: number; height: number };
		xLabel: string;
		yLabel: string;
		xKey: keyof SpecimenPublic;
		yKey: keyof SpecimenPublic;
		onPointClick?: (specimen: SpecimenPublic) => void;
		tooltipRef: React.RefObject<HTMLButtonElement | null>;
		onTooltipLeave: () => void;
	}) => (
		<button
			ref={tooltipRef}
			type="button"
			style={{
				position: "absolute",
				left: Math.min(tooltipPos.x + 15, dimensions.width - 300),
				top: tooltipPos.y - 10,
				pointerEvents: "auto",
				zIndex: 50,
			}}
			className="max-w-sm rounded-lg border bg-background p-3 text-left shadow-xl"
			onClick={() => onPointClick?.(hoveredPoint)}
			onMouseLeave={onTooltipLeave}
			onBlur={(event) => {
				if (!event.currentTarget.contains(event.relatedTarget)) {
					onTooltipLeave();
				}
			}}
			aria-label={`Open specimen details for ${hoveredPoint.specimen_reference_id || "selected point"}`}
		>
			<div className="font-semibold text-sm mb-2">
				{hoveredPoint.specimen_reference_id || "N/A"}
			</div>
			<div className="space-y-1 text-xs">
				<div className="flex justify-between gap-3">
					<span className="text-muted-foreground">{xLabel}:</span>
					<span className="font-mono">
						{isNumericValue(hoveredPoint[xKey])
							? (hoveredPoint[xKey] as number).toFixed(2)
							: "N/A"}
					</span>
				</div>
				<div className="flex justify-between gap-3">
					<span className="text-muted-foreground">{yLabel}:</span>
					<span className="font-mono">
						{isNumericValue(hoveredPoint[yKey])
							? (hoveredPoint[yKey] as number).toFixed(2)
							: "N/A"}
					</span>
				</div>
				{isNumericValue(hoveredPoint.e_stiffness) && xKey !== "e_stiffness" && (
					<div className="flex justify-between gap-3">
						<span className="text-muted-foreground">Stiffness:</span>
						<span className="font-mono">
							{hoveredPoint.e_stiffness.toFixed(2)}
						</span>
					</div>
				)}
				{isNumericValue(hoveredPoint.e_ductility) && yKey !== "e_ductility" && (
					<div className="flex justify-between gap-3">
						<span className="text-muted-foreground">Ductility:</span>
						<span className="font-mono">
							{hoveredPoint.e_ductility.toFixed(2)}
						</span>
					</div>
				)}
				{isNumericValue(hoveredPoint.e_yield_force) &&
					yKey !== "e_yield_force" && (
						<div className="flex justify-between gap-3">
							<span className="text-muted-foreground">Yield Force:</span>
							<span className="font-mono">
								{hoveredPoint.e_yield_force.toFixed(2)}
							</span>
						</div>
					)}
				{hoveredPoint.joinery_type && (
					<div className="flex items-center gap-2 pt-1 border-t mt-1">
						<span className="text-muted-foreground font-medium">Joinery:</span>
						<span className="font-medium bg-primary/10 px-1.5 py-0.5 rounded text-xs">
							{typeof hoveredPoint.joinery_type === "string"
								? hoveredPoint.joinery_type
								: hoveredPoint.joinery_type.label || "N/A"}
						</span>
					</div>
				)}
				{onPointClick && (
					<div className="border-t mt-2 pt-2 text-[11px] font-medium text-primary">
						Open specimen details
					</div>
				)}
			</div>
		</button>
	),
);
ScatterTooltip.displayName = "ScatterTooltip";

export function ScatterPlotD3({
	data,
	fastenerTypesData,
	xKey,
	yKey,
	xLabel,
	yLabel,
	height,
	isExpanded = false,
	onPointClick,
}: ScatterPlotD3Props) {
	const svgRef = useRef<SVGSVGElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	// Unique per-instance ID so multiple charts don't share the same clip path
	const clipId = useRef(`chart-clip-${Math.random().toString(36).slice(2)}`);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
	const [hoveredPoint, setHoveredPoint] = useState<SpecimenPublic | null>(null);
	const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
	const [zoomExtent, setZoomExtent] = useState<ZoomExtent | null>(null);
	const [zoomMode, setZoomMode] = useState(false);
	const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
	const tooltipRef = useRef<HTMLButtonElement | null>(null);
	const chartHeight = isExpanded ? undefined : height;

	useEffect(() => {
		if (!containerRef.current) return;
		const observer = new ResizeObserver(([entry]) => {
			const { width, height: h } = entry.contentRect;
			if (width > 0 && h > 0) {
				setDimensions({ width, height: h });
			}
		});
		observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, []);

	const groupedData = useMemo(() => {
		const validData = data.filter(
			(s) => isNumericValue(s[xKey]) && isNumericValue(s[yKey]),
		);
		const groups = groupSpecimensByFastener(
			{ count: validData.length, data: validData },
			fastenerTypesData,
		);
		const colors = getChartColors();
		return Object.entries(groups).map(([groupName, specimens], index) => ({
			groupName,
			specimens,
			color: colors[index % colors.length],
			shape: SHAPES[index % SHAPES.length],
		}));
	}, [data, fastenerTypesData, xKey, yKey]);

	const scatterMargins = useMemo(() => {
		if (dimensions.width > 0 && dimensions.width < 400) {
			return { top: 4, right: 6, bottom: 48, left: 46 };
		}
		if (dimensions.width > 0 && dimensions.width < 640) {
			return { top: 6, right: 8, bottom: 52, left: 50 };
		}
		return CHART_CONFIG.scatterMargins;
	}, [dimensions.width]);

	const boundsWidth =
		dimensions.width - scatterMargins.left - scatterMargins.right;
	const boundsHeight =
		dimensions.height - scatterMargins.top - scatterMargins.bottom;

	const { xScale, yScale } = useMemo(() => {
		const allValues = groupedData.flatMap((g) =>
			g.specimens.map((s) => ({
				x: s[xKey] as number,
				y: s[yKey] as number,
			})),
		);

		if (allValues.length === 0 || boundsWidth <= 0 || boundsHeight <= 0) {
			return {
				xScale: d3
					.scaleLinear()
					.domain([0, 1])
					.range([0, Math.max(boundsWidth, 1)]),
				yScale: d3
					.scaleLinear()
					.domain([0, 1])
					.range([Math.max(boundsHeight, 1), 0]),
			};
		}

		const xExtent =
			zoomExtent?.x || (d3.extent(allValues, (d) => d.x) as [number, number]);
		const yExtent =
			zoomExtent?.y || (d3.extent(allValues, (d) => d.y) as [number, number]);

		return {
			xScale: d3.scaleLinear().domain(xExtent).range([0, boundsWidth]).nice(),
			yScale: d3.scaleLinear().domain(yExtent).range([boundsHeight, 0]).nice(),
		};
	}, [groupedData, boundsWidth, boundsHeight, xKey, yKey, zoomExtent]);

	const handleZoomOut = useCallback(() => setZoomExtent(null), []);
	const toggleZoomMode = useCallback(() => {
		setZoomMode((prev) => !prev);
		setHoveredPoint(null);
	}, []);

	useEffect(() => {
		if (!svgRef.current) return;
		if (boundsWidth <= 0 || boundsHeight <= 0) return;

		const svg = d3.select(svgRef.current);
		const g = svg.select<SVGGElement>(".chart-area");

		g.selectAll(".grid").remove();
		g.selectAll(".axis").remove();
		g.selectAll(".axis-label").remove();
		g.selectAll(".brush").remove();

		svg.select("defs").remove();
		svg
			.append("defs")
			.append("clipPath")
			.attr("id", clipId.current)
			.append("rect")
			.attr("width", boundsWidth)
			.attr("height", boundsHeight);

		g.append("g")
			.attr("class", "grid")
			.attr("opacity", 0.1)
			.call(
				d3
					.axisLeft(yScale)
					.tickSize(-boundsWidth)
					.tickFormat(() => ""),
			);

		g.append("g")
			.attr("class", "grid")
			.attr("opacity", 0.1)
			.attr("transform", `translate(0,${boundsHeight})`)
			.call(
				d3
					.axisBottom(xScale)
					.tickSize(-boundsHeight)
					.tickFormat(() => ""),
			);

		const xAxis = g
			.append("g")
			.attr("class", "axis x-axis")
			.attr("transform", `translate(0,${boundsHeight})`)
			.call(d3.axisBottom(xScale));

		const yAxis = g
			.append("g")
			.attr("class", "axis y-axis")
			.call(d3.axisLeft(yScale));

		[xAxis, yAxis].forEach((axis) => {
			axis
				.selectAll("text")
				.attr("fill", "currentColor")
				.attr("font-size", "12px");
			axis.selectAll("line").attr("stroke", "currentColor");
			axis.select(".domain").attr("stroke", "currentColor");
		});

		g.append("text")
			.attr("class", "axis-label x-label")
			.attr("text-anchor", "middle")
			.attr("x", boundsWidth / 2)
			.attr("y", boundsHeight + Math.max(34, scatterMargins.bottom - 8))
			.attr("fill", "currentColor")
			.attr("font-size", dimensions.width < 400 ? "12px" : "14px")
			.text(xLabel);

		g.append("text")
			.attr("class", "axis-label y-label")
			.attr("text-anchor", "middle")
			.attr("transform", "rotate(-90)")
			.attr("x", -boundsHeight / 2)
			.attr("y", -Math.max(30, scatterMargins.left - 12))
			.attr("fill", "currentColor")
			.attr("font-size", dimensions.width < 400 ? "12px" : "14px")
			.text(yLabel);

		let pointsContainer = g.select<SVGGElement>(".points-container");
		if (pointsContainer.empty()) {
			pointsContainer = g
				.append("g")
				.attr("class", "points-container")
				.attr("clip-path", `url(#${clipId.current})`);
		}

		groupedData.forEach((group) => {
			const isGroupFaded = hoveredGroup && group.shape !== hoveredGroup;

			let scatterGroup = pointsContainer.select<SVGGElement>(
				`.scatter-group-${group.shape}`,
			);
			if (scatterGroup.empty()) {
				scatterGroup = pointsContainer
					.append("g")
					.attr("class", `scatter-group scatter-group-${group.shape}`)
					.attr("data-group", group.groupName);
			}

			scatterGroup
				.selectAll<SVGPathElement, SpecimenPublic>("path")
				.data(
					group.specimens,
					(d) => d.id || d.specimen_reference_id || String(Math.random()),
				)
				.join(
					(enter) =>
						enter
							.append("path")
							.attr(
								"d",
								SHAPE_GENERATORS[group.shape](CHART_CONFIG.pointRadius),
							)
							.attr("fill", group.color)
							.attr("fill-opacity", 1)
							.attr("stroke", group.color)
							.attr("stroke-width", 1)
							.attr("stroke-opacity", 0)
							.attr("transform", (d) => {
								const x = xScale(d[xKey] as number);
								const y = yScale(d[yKey] as number);
								return `translate(${x},${y})`;
							})
							.call((enter) =>
								enter
									.transition()
									.duration(CHART_CONFIG.transitionDuration)
									.attr("fill-opacity", 0.6)
									.attr("stroke-opacity", 0.8),
							),
					(update) =>
						update.call((update) =>
							update
								.transition()
								.duration(CHART_CONFIG.transitionDuration)
								.attr("transform", (d) => {
									const x = xScale(d[xKey] as number);
									const y = yScale(d[yKey] as number);
									return `translate(${x},${y})`;
								})
								.attr("class", isGroupFaded ? "opacity-10" : ""),
						),
					(exit) =>
						exit.call((exit) =>
							exit
								.transition()
								.duration(CHART_CONFIG.transitionDuration)
								.attr("fill-opacity", 0)
								.attr("stroke-opacity", 0)
								.remove(),
						),
				)
				.style("cursor", onPointClick ? "pointer" : "default")
				.on("mouseenter", function (event, d) {
					if (zoomMode) return;
					setHoveredGroup(group.shape);
					d3.select(this)
						.transition()
						.duration(150)
						.attr("fill-opacity", 1)
						.attr("stroke-width", 2)
						.attr(
							"d",
							SHAPE_GENERATORS[group.shape](CHART_CONFIG.pointRadius * 1.5),
						);
					d3.select(this).raise();
					setHoveredPoint(d);
					const rect = containerRef.current?.getBoundingClientRect();
					if (rect) {
						setTooltipPos({
							x: event.clientX - rect.left,
							y: event.clientY - rect.top,
						});
					}
				})
				.on("mousemove", (event) => {
					if (zoomMode) return;
					const rect = containerRef.current?.getBoundingClientRect();
					if (rect) {
						setTooltipPos({
							x: event.clientX - rect.left,
							y: event.clientY - rect.top,
						});
					}
				})
				.on("mouseleave", function (event) {
					if (
						tooltipRef.current &&
						event.relatedTarget instanceof Node &&
						tooltipRef.current.contains(event.relatedTarget)
					) {
						return;
					}
					setHoveredGroup(null);
					d3.select(this)
						.transition()
						.duration(150)
						.attr("fill-opacity", 0.6)
						.attr("stroke-width", 1)
						.attr("d", SHAPE_GENERATORS[group.shape](CHART_CONFIG.pointRadius));
					setHoveredPoint(null);
				})
				.on("click", (event, d) => {
					if (onPointClick && !zoomMode) {
						event.stopPropagation();
						onPointClick(d);
					}
				});
		});

		if (zoomMode) {
			const brush = d3
				.brush()
				.extent([
					[0, 0],
					[boundsWidth, boundsHeight],
				])
				.on("end", (event) => {
					if (!event.selection) return;
					const [[x0, y0], [x1, y1]] = event.selection as [
						[number, number],
						[number, number],
					];
					setZoomExtent({
						x: [xScale.invert(x0), xScale.invert(x1)],
						y: [yScale.invert(y1), yScale.invert(y0)],
					});
					g.select(".brush").call(brush.move, null);
				});

			const brushGroup = g.append("g").attr("class", "brush").call(brush);
			brushGroup.select(".overlay").style("cursor", "crosshair");
			brushGroup
				.select(".selection")
				.attr("fill", "steelblue")
				.attr("fill-opacity", 0.2)
				.attr("stroke", "steelblue");
		}
	}, [
		groupedData,
		xScale,
		yScale,
		boundsWidth,
		boundsHeight,
		xLabel,
		yLabel,
		onPointClick,
		zoomMode,
		hoveredGroup,
		scatterMargins.bottom,
		scatterMargins.left,
		xKey,
		yKey,
		dimensions.width,
	]);

	if (data.length === 0) {
		return (
			<div
				className="flex items-center justify-center text-muted-foreground"
				style={chartHeight ? { height: `${chartHeight}px` } : undefined}
			>
				No data available
			</div>
		);
	}

	return (
		<div
			className={`w-full flex flex-col gap-1.5 sm:gap-2 ${!chartHeight ? "h-full" : ""}`}
		>
			<div className="flex items-center justify-between gap-2 flex-shrink-0">
				<div className="min-w-0 text-xs text-muted-foreground whitespace-nowrap">
					{zoomMode
						? "💡 Drag to select zoom area"
						: "💡 Hover and click points to explore"}
				</div>
				<div className="flex gap-1.5 sm:gap-2">
					<Button
						variant={zoomMode ? "default" : "outline"}
						size="sm"
						onClick={toggleZoomMode}
						className="h-7 w-7 px-0 text-xs sm:h-8 sm:w-auto sm:px-3"
						aria-pressed={zoomMode}
						aria-label={zoomMode ? "Exit zoom mode" : "Enter zoom mode"}
					>
						<ZoomInIcon className="h-3 w-3 sm:mr-1" aria-hidden="true" />
						<span className="hidden sm:inline">
							{zoomMode ? "Exit Zoom" : "Zoom Mode"}
						</span>
					</Button>
					{zoomExtent && (
						<Button
							variant="outline"
							size="sm"
							onClick={handleZoomOut}
							className="h-7 w-7 px-0 text-xs sm:h-8 sm:w-auto sm:px-3"
							aria-label="Reset zoom"
						>
							<RotateCcwIcon className="h-3 w-3 sm:mr-1" aria-hidden="true" />
							<span className="hidden sm:inline">Reset</span>
						</Button>
					)}
				</div>
			</div>

			<div
				ref={containerRef}
				className={`relative w-full ${!chartHeight ? "flex-1 min-h-0" : ""}`}
				style={chartHeight ? { height: `${chartHeight}px` } : undefined}
				role="img"
				aria-label={`Scatter plot of ${yLabel} vs ${xLabel}`}
			>
				<svg
					ref={svgRef}
					width="100%"
					height="100%"
					className="text-foreground absolute inset-0"
					role="img"
					aria-label={`Scatter plot of ${yLabel} vs ${xLabel}`}
				>
					<g
						className="chart-area"
						transform={`translate(${scatterMargins.left},${scatterMargins.top})`}
					/>
				</svg>

				{hoveredPoint && !zoomMode && (
					<ScatterTooltip
						hoveredPoint={hoveredPoint}
						tooltipPos={tooltipPos}
						dimensions={dimensions}
						xLabel={xLabel}
						yLabel={yLabel}
						xKey={xKey}
						yKey={yKey}
						onPointClick={onPointClick}
						tooltipRef={tooltipRef}
						onTooltipLeave={() => {
							setHoveredPoint(null);
							setHoveredGroup(null);
						}}
					/>
				)}
			</div>

			<Legend groupedData={groupedData} />
		</div>
	);
}
