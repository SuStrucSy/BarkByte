// ImprovedScatterPlot.tsx - Production-ready version

import { useEffect, useMemo, useRef, useState, useCallback, memo } from "react";
import * as d3 from "d3";
import type { FastenerTypes, SpecimenPublic } from "@/api/model";
import { getChartColors, groupSpecimensByFastener } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { isNumericValue } from "@/lib/typeGuards";
import {
  CHART_CONFIG,
  SHAPE_GENERATORS,
  SHAPES,
} from "@/components/Charts/chartConfig";
import useDebounce from "@/hooks/use-debounce";

interface ScatterPlotD3Props {
  data: SpecimenPublic[];
  fastenerTypesData: FastenerTypes | undefined;
  xKey: keyof SpecimenPublic;
  yKey: keyof SpecimenPublic;
  xLabel: string;
  yLabel: string;
  height?: number;
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

// Memoized Legend component
const Legend = memo(({ groupedData }: { groupedData: GroupedDataItem[] }) => (
  <div
    className="flex flex-wrap justify-center gap-4 pt-2"
    role="list"
    aria-label="Chart legend"
  >
    {groupedData.map((group) => (
      <div
        key={group.groupName}
        className="flex items-center gap-2 text-sm"
        role="listitem"
      >
        <svg width="20" height="20" aria-hidden="true">
          <path
            d={SHAPE_GENERATORS[group.shape](6)}
            transform="translate(10,10)"
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

// Memoized Tooltip component
const ScatterTooltip = memo(
  ({
    hoveredPoint,
    tooltipPos,
    dimensions,
    xLabel,
    yLabel,
    xKey,
    yKey,
  }: {
    hoveredPoint: SpecimenPublic;
    tooltipPos: { x: number; y: number };
    dimensions: { width: number; height: number };
    xLabel: string;
    yLabel: string;
    xKey: keyof SpecimenPublic;
    yKey: keyof SpecimenPublic;
  }) => (
    <div
      style={{
        position: "absolute",
        left: Math.min(tooltipPos.x + 15, dimensions.width - 300),
        top: tooltipPos.y - 10,
        pointerEvents: "none",
        zIndex: 50,
      }}
      className="rounded-lg border bg-background p-3 shadow-xl max-w-sm"
      role="tooltip"
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
      </div>
    </div>
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
  height = 500,
  onPointClick,
}: ScatterPlotD3Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height });
  const [hoveredPoint, setHoveredPoint] = useState<SpecimenPublic | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [zoomExtent, setZoomExtent] = useState<ZoomExtent | null>(null);
  const [zoomMode, setZoomMode] = useState(false);
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);

  // Filter and group data
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

  // Calculate bounds
  const boundsWidth =
    dimensions.width -
    CHART_CONFIG.scatterMargins.left -
    CHART_CONFIG.scatterMargins.right;
  const boundsHeight =
    dimensions.height -
    CHART_CONFIG.scatterMargins.top -
    CHART_CONFIG.scatterMargins.bottom;

  // Create scales with proper null handling
  const { xScale, yScale } = useMemo(() => {
    const allValues = groupedData.flatMap((g) =>
      g.specimens.map((s) => ({
        x: s[xKey] as number,
        y: s[yKey] as number,
      })),
    );

    if (allValues.length === 0) {
      return {
        xScale: d3.scaleLinear().domain([0, 1]).range([0, boundsWidth]),
        yScale: d3.scaleLinear().domain([0, 1]).range([boundsHeight, 0]),
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

  const handleZoomOut = useCallback(() => {
    setZoomExtent(null);
  }, []);

  const toggleZoomMode = useCallback(() => {
    setZoomMode((prev) => !prev);
    setHoveredPoint(null);
  }, []);

  // D3 rendering with update pattern
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = svg.select<SVGGElement>(".chart-area");

    // Use D3's join pattern for better performance
    const updateChart = () => {
      // Clear only what's needed
      g.selectAll(".grid").remove();
      g.selectAll(".axis").remove();
      g.selectAll(".axis-label").remove();
      g.selectAll(".brush").remove();

      // Create clip path
      svg.select("defs").remove();
      const defs = svg.append("defs");
      defs
        .append("clipPath")
        .attr("id", "chart-clip")
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", boundsWidth)
        .attr("height", boundsHeight);

      // Add grid
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

      // Add axes
      const xAxis = g
        .append("g")
        .attr("class", "axis x-axis")
        .attr("transform", `translate(0,${boundsHeight})`)
        .call(d3.axisBottom(xScale));

      const yAxis = g
        .append("g")
        .attr("class", "axis y-axis")
        .call(d3.axisLeft(yScale));

      // Style axes
      [xAxis, yAxis].forEach((axis) => {
        axis
          .selectAll("text")
          .attr("fill", "currentColor")
          .attr("font-size", "12px");
        axis.selectAll("line").attr("stroke", "currentColor");
        axis.select(".domain").attr("stroke", "currentColor");
      });

      // Add axis labels
      g.append("text")
        .attr("class", "axis-label x-label")
        .attr("text-anchor", "middle")
        .attr("x", boundsWidth / 2)
        .attr("y", boundsHeight + 45)
        .attr("fill", "currentColor")
        .attr("font-size", "14px")
        .text(xLabel);

      g.append("text")
        .attr("class", "axis-label y-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -boundsHeight / 2)
        .attr("y", -50)
        .attr("fill", "currentColor")
        .attr("font-size", "14px")
        .text(yLabel);

      // Get or create points container
      let pointsContainer = g.select<SVGGElement>(".points-container");
      if (pointsContainer.empty()) {
        pointsContainer = g
          .append("g")
          .attr("class", "points-container")
          .attr("clip-path", "url(#chart-clip)");
      }

      // Update points using D3's join pattern
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

            const containerRect = containerRef.current?.getBoundingClientRect();
            if (containerRect) {
              setTooltipPos({
                x: event.clientX - containerRect.left,
                y: event.clientY - containerRect.top,
              });
            }
          })
          .on("mousemove", function (event) {
            if (zoomMode) return;

            const containerRect = containerRef.current?.getBoundingClientRect();
            if (containerRect) {
              setTooltipPos({
                x: event.clientX - containerRect.left,
                y: event.clientY - containerRect.top,
              });
            }
          })
          .on("mouseleave", function () {
            setHoveredGroup(null);

            d3.select(this)
              .transition()
              .duration(150)
              .attr("fill-opacity", 0.6)
              .attr("stroke-width", 1)
              .attr(
                "d",
                SHAPE_GENERATORS[group.shape](CHART_CONFIG.pointRadius),
              );

            setHoveredPoint(null);
          })
          .on("click", (event, d) => {
            if (onPointClick && !zoomMode) {
              event.stopPropagation();
              onPointClick(d);
            }
          });
      });

      // Zoom behavior
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

            g.select(".brush").call(brush.move as any, null);
          });

        const brushGroup = g.append("g").attr("class", "brush").call(brush);

        brushGroup.select(".overlay").style("cursor", "crosshair");
        brushGroup
          .select(".selection")
          .attr("fill", "steelblue")
          .attr("fill-opacity", 0.2)
          .attr("stroke", "steelblue");
      }
    };

    updateChart();
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
    xKey,
    yKey,
  ]);

  const debouncedWindowSize = useDebounce(
    dimensions,
    CHART_CONFIG.resizeDebounceMs,
  );

  // Debounced resize handler
  useEffect(() => {
    const handleResize = (entries: ResizeObserverEntry[]) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [debouncedWindowSize]);

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground"
        style={{ height: `${height}px` }}
        role="status"
      >
        No data available
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {zoomMode
            ? "💡 Drag to select zoom area"
            : "💡 Hover and click points to explore"}
        </div>
        <div className="flex gap-2">
          <Button
            variant={zoomMode ? "default" : "outline"}
            size="sm"
            onClick={toggleZoomMode}
            className="text-xs"
            aria-pressed={zoomMode}
            aria-label={zoomMode ? "Exit zoom mode" : "Enter zoom mode"}
          >
            <ZoomInIcon className="h-3 w-3 mr-1" aria-hidden="true" />
            {zoomMode ? "Exit Zoom" : "Zoom Mode"}
          </Button>
          {zoomExtent && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              className="text-xs"
              aria-label="Reset zoom"
            >
              <ZoomOutIcon className="h-3 w-3 mr-1" aria-hidden="true" />
              Reset
            </Button>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full"
        style={{ height: `${height}px` }}
        role="img"
        aria-label={`Scatter plot of ${yLabel} vs ${xLabel}`}
      >
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="text-foreground"
        >
          <g
            className="chart-area"
            transform={`translate(${CHART_CONFIG.scatterMargins.left},${CHART_CONFIG.scatterMargins.top})`}
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
          />
        )}
      </div>

      <Legend groupedData={groupedData} />
    </div>
  );
}
