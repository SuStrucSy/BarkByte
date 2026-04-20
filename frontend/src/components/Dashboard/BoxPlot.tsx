import * as d3 from "d3";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { SpecimenPublic } from "@/api/model";
import { CHART_CONFIG } from "@/components/Charts/chartConfig";
import { isNumericValue } from "@/lib/typeGuards";
import { getChartColors, getSummaryStats } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { AxisBottom } from "./AxisBottomCategoric";
import { AxisLeft } from "./AxisLeft";
import { VerticalBox } from "./VerticalBox";
import { VerticalViolinShape } from "./VerticalViolinShape";

interface BoxPlotProps {
  selectedSpecimens: SpecimenPublic[];
  yKey: keyof SpecimenPublic;
  yLabel: string;
  onPointClick?: (specimen: SpecimenPublic) => void;
  mirrorPosition?: number;
  smoothing?: boolean;
  height?: number;
}

// Stable jitter hook with proper memoization
const useStableJitter = (specimens: SpecimenPublic[]) => {
  return useMemo(() => {
    const jitterMap = new Map<string, number>();

    specimens.forEach((specimen) => {
      const id = specimen.id || specimen.specimen_reference_id;
      if (!id) return;

      // Simple hash function for deterministic jitter
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        hash = (hash << 5) - hash + id.charCodeAt(i);
        hash = hash & hash; // Convert to 32-bit integer
      }

      // Normalize to 0-1 range and scale to jitter width
      const normalized = Math.abs(hash % 10000) / 10000;
      jitterMap.set(id, normalized * CHART_CONFIG.jitterWidth);
    });

    return jitterMap;
  }, [specimens]);
};

// DataPoint component - optimized with stable keys and no memo overhead
function DataPoint({
  specimen,
  baseX,
  cy,
  yKey,
  jitter,
  onPointClick,
}: {
  specimen: SpecimenPublic;
  baseX: number;
  cy: number;
  yKey: keyof SpecimenPublic;
  jitter: number;
  onPointClick?: (specimen: SpecimenPublic) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const cx = baseX - CHART_CONFIG.jitterWidth / 2 + jitter;
  const isInteractive = Boolean(onPointClick);

  const interactiveProps = isInteractive
    ? {
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
        onClick: () => onPointClick?.(specimen),
        onKeyDown: (e: React.KeyboardEvent<SVGCircleElement>) => {
          if (e.key === "Enter" || e.key === " ") onPointClick?.(specimen);
        },
      }
    : {};

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <circle
          cx={cx}
          cy={cy}
          r={
            isHovered
              ? CHART_CONFIG.pointRadius + 1
              : CHART_CONFIG.pointRadius - 1
          }
          className={isHovered ? "fill-red-500" : "fill-red-400"}
          stroke="currentColor"
          strokeOpacity={isHovered ? 0.6 : 0.2}
          fillOpacity={isHovered ? 0.8 : 0.3}
          style={{
            cursor: isInteractive ? "pointer" : "default",
            transition: "all 0.2s ease",
            color: "hsl(var(--foreground))",
          }}
          role={isInteractive ? "button" : "img"}
          aria-label={`Data point: ${specimen.specimen_reference_id || "Unknown"}`}
          tabIndex={isInteractive ? 0 : -1}
          {...interactiveProps}
        />
      </TooltipTrigger>
      <TooltipContent
        side="right"
        className="max-w-xs border bg-background text-foreground shadow-xl"
      >
        <button
          type="button"
          className="space-y-2 text-left"
          onClick={() => onPointClick?.(specimen)}
          disabled={!isInteractive}
          aria-label={
            isInteractive
              ? `Open specimen details for ${specimen.specimen_reference_id || "selected point"}`
              : undefined
          }
        >
          <div className="font-semibold text-sm">
            {specimen.specimen_reference_id || "N/A"}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <span className="text-muted-foreground">{String(yKey)}:</span>
            <span className="font-mono">
              {isNumericValue(specimen[yKey])
                ? (specimen[yKey] as number).toFixed(2)
                : "N/A"}
            </span>

            {isNumericValue(specimen.e_ductility) && (
              <>
                <span className="text-muted">Ductility:</span>
                <span className="font-mono">
                  {specimen.e_ductility.toFixed(2)}
                </span>
              </>
            )}

            {isNumericValue(specimen.e_yield_force) && (
              <>
                <span className="text-muted">Yield Force:</span>
                <span className="font-mono">
                  {specimen.e_yield_force.toFixed(2)}
                </span>
              </>
            )}

            {specimen.joinery_type?.label && (
              <>
                <span className="text-muted-foreground">Joinery:</span>
                <span className="font-medium">
                  {specimen.joinery_type.label}
                </span>
              </>
            )}
          </div>
          {isInteractive ? (
            <div className="border-t pt-2 text-[11px] font-medium text-primary">
              Open specimen details
            </div>
          ) : null}
        </button>
      </TooltipContent>
    </Tooltip>
  );
}

DataPoint.displayName = "DataPoint";

export function BoxPlot({
  selectedSpecimens,
  yKey,
  yLabel,
  onPointClick,
  mirrorPosition = 0,
  smoothing = true,
  height = 400,
}: BoxPlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height });

  // Responsive margins based on container width
  const margins = useMemo(() => {
    const w = dimensions.width;
    if (w < 400) return { top: 20, right: 10, bottom: 80, left: 66 };
    if (w < 640) return { top: 20, right: 15, bottom: 80, left: 62 };
    return CHART_CONFIG.margins;
  }, [dimensions.width]);

  const yAxisTitleOffset = useMemo(() => {
    if (dimensions.width < 400) return -38;
    if (dimensions.width < 640) return -40;
    return -40;
  }, [dimensions.width]);

  // Responsive height
  const responsiveHeight = useMemo(() => {
    const w = dimensions.width;
    if (w < 400) return Math.min(height, 280);
    if (w < 640) return Math.min(height, 350);
    return height;
  }, [dimensions.width, height]);

  const boundsWidth = useMemo(
    () => Math.max(0, dimensions.width - margins.right - margins.left),
    [dimensions.width, margins],
  );

  const boundsHeight = useMemo(
    () => Math.max(0, responsiveHeight - margins.top - margins.bottom),
    [responsiveHeight, margins],
  );

  // Filter valid specimens once
  const validSpecimens = useMemo(() => {
    return selectedSpecimens.filter(
      (s) => s.joinery_type?.label && isNumericValue(s[yKey]),
    );
  }, [selectedSpecimens, yKey]);

  const jitterMap = useStableJitter(validSpecimens);

  // Compute chart data with proper error handling
  const chartData = useMemo(() => {
    const groups = [
      ...new Set(validSpecimens.map((s) => s.joinery_type?.label)),
    ];

    const allStats = groups
      .map((group) => {
        const groupData = validSpecimens
          .filter((s) => s.joinery_type?.label === group)
          .map((s) => s[yKey] as number);

        return getSummaryStats(groupData);
      })
      .filter((stat): stat is NonNullable<typeof stat> => stat !== null);

    if (allStats.length === 0) {
      return { chartMin: 0, chartMax: 1, groups: [] };
    }

    const minMaxValues = allStats.flatMap((stat) => [stat.min, stat.max]);
    const [chartMin = 0, chartMax = 1] = d3.extent(minMaxValues) as [
      number,
      number,
    ];

    return { chartMin, chartMax, groups };
  }, [validSpecimens, yKey]);

  // Compute scales
  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([chartData.chartMin, chartData.chartMax])
      .range([boundsHeight, 0])
      .nice();
  }, [chartData.chartMin, chartData.chartMax, boundsHeight]);

  const xScale = useMemo(() => {
    return d3
      .scaleBand()
      .range([0, boundsWidth])
      .domain(chartData.groups)
      .padding(0.15);
  }, [boundsWidth, chartData.groups]);

  const colorScale = useMemo(() => {
    const colors = getChartColors();
    return d3.scaleOrdinal<string>().domain(chartData.groups).range(colors);
  }, [chartData.groups]);

  // Performance threshold
  const enableInteractions =
    validSpecimens.length <= CHART_CONFIG.maxInteractivePoints;

  // Build box shapes
  const allBoxes = useMemo(() => {
    return chartData.groups
      .map((group) => {
        const groupSpecimens = validSpecimens.filter(
          (s) => s.joinery_type?.label === group,
        );
        const groupData = groupSpecimens.map((s) => s[yKey] as number);

        const sumStats = getSummaryStats(groupData);
        if (!sumStats) return null;

        const { min, q1, median, q3, max } = sumStats;
        const bandwidth = xScale.bandwidth();
        const baseX = bandwidth / 2;

        return (
          <div
            key={group}
            style={{
              position: "absolute",
              top: 0,
              width: bandwidth,
              height: boundsHeight,
              left: xScale(group),
              opacity: mirrorPosition === 0 ? 1 : 0,
              transition: `opacity ${CHART_CONFIG.transitionDuration}ms ease`,
            }}
          >
            <svg
              height={boundsHeight}
              width={bandwidth}
              role="img"
              aria-label="box shapes"
            >
              <VerticalBox
                width={bandwidth}
                q1={yScale(q1)}
                median={yScale(median)}
                q3={yScale(q3)}
                min={yScale(min)}
                max={yScale(max)}
                stroke="currentcolor"
                fill={colorScale(group)}
              />
              {enableInteractions && (
                <g aria-label={`Data points for ${group}`}>
                  {groupSpecimens.map((specimen) => {
                    const value = specimen[yKey] as number;
                    const id =
                      specimen.id || specimen.specimen_reference_id || "";
                    const jitter = jitterMap.get(id) ?? 0;

                    return (
                      <DataPoint
                        key={id}
                        specimen={specimen}
                        baseX={baseX}
                        cy={yScale(value)}
                        yKey={yKey}
                        jitter={jitter}
                        onPointClick={onPointClick}
                      />
                    );
                  })}
                </g>
              )}
            </svg>
          </div>
        );
      })
      .filter(Boolean);
  }, [
    chartData.groups,
    boundsHeight,
    colorScale,
    mirrorPosition,
    onPointClick,
    validSpecimens,
    xScale,
    yKey,
    yScale,
    jitterMap,
    enableInteractions,
  ]);

  // Violin plots
  const allViolins = useMemo(() => {
    return chartData.groups
      .map((group) => {
        const groupData = validSpecimens
          .filter((s) => s.joinery_type?.label === group)
          .map((s) => s[yKey] as number);

        if (groupData.length === 0) return null;

        return (
          <div
            key={`violin-${group}`}
            style={{
              position: "absolute",
              top: 0,
              width: mirrorPosition * xScale.bandwidth(),
              height: boundsHeight,
              left: xScale(group),
              overflow: "hidden",
              transition: `width ${CHART_CONFIG.transitionDuration}ms ease`,
            }}
          >
            <svg
              height={boundsHeight}
              width={xScale.bandwidth()}
              role="img"
              aria-label="Violin shapes"
            >
              <VerticalViolinShape
                data={groupData}
                binNumber={10}
                yScale={yScale}
                width={xScale.bandwidth()}
                fill={colorScale(group)}
                stroke="currentcolor"
                smoothing={smoothing}
              />
            </svg>
          </div>
        );
      })
      .filter(Boolean);
  }, [
    chartData.groups,
    boundsHeight,
    colorScale,
    mirrorPosition,
    validSpecimens,
    smoothing,
    xScale,
    yKey,
    yScale,
  ]);

  // Initial layout can briefly report width 0 on refresh.
  // Retry on animation frames until layout stabilizes, while also observing
  // later container resizes.
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    let frameId = 0;
    let cancelled = false;

    const measure = () => {
      if (!containerRef.current || cancelled) return false;
      const { width, height: measuredHeight } =
        containerRef.current.getBoundingClientRect();
      if (width > 0) {
        setDimensions({
          width,
          height: measuredHeight > 0 ? measuredHeight : height,
        });
        return true;
      }
      return false;
    };

    const measureUntilReady = (attemptsLeft: number) => {
      if (measure() || attemptsLeft <= 0 || cancelled) {
        return;
      }
      frameId = requestAnimationFrame(() =>
        measureUntilReady(attemptsLeft - 1),
      );
    };

    measureUntilReady(12);

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry || cancelled) return;
      if (entry.contentRect.width > 0) {
        setDimensions({
          width: entry.contentRect.width,
          height:
            entry.contentRect.height > 0 ? entry.contentRect.height : height,
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    };
  }, [height]);

  // Empty state
  if (validSpecimens.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground h-full min-h-96 w-full"
        aria-live="polite"
      >
        No valid data available for selected parameters
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div
        ref={containerRef}
        className="relative w-full min-w-0 overflow-hidden"
        style={{ height: responsiveHeight }}
        role="img"
        aria-label={`Box plot showing ${yLabel} distribution across ${chartData.groups.length} groups`}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: responsiveHeight,
            transition: `height ${CHART_CONFIG.transitionDuration}ms ease`,
          }}
        >
          <div
            style={{
              width: "100%",
              height: responsiveHeight,
              position: "absolute",
              top: 0,
              left: 0,
              transition: `height ${CHART_CONFIG.transitionDuration}ms ease`,
            }}
          >
            <div
              style={{
                width: boundsWidth,
                height: boundsHeight,
                transform: `translate(${margins.left}px, ${margins.top}px)`,
                transition: `width ${CHART_CONFIG.transitionDuration}ms ease, height ${CHART_CONFIG.transitionDuration}ms ease, transform ${CHART_CONFIG.transitionDuration}ms ease`,
              }}
            >
              {allBoxes}
              {allViolins}
            </div>
          </div>
          <svg
            width="100%"
            height={responsiveHeight}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              pointerEvents: "none",
              transition: `height ${CHART_CONFIG.transitionDuration}ms ease`,
            }}
            className="text-foreground"
            aria-hidden="true"
          >
            <g
              transform={`translate(${margins.left}, ${margins.top})`}
              style={{ color: "hsl(var(--foreground))" }}
            >
              <AxisLeft
                yScale={yScale}
                pixelsPerTick={
                  boundsWidth < 400 ? 60 : CHART_CONFIG.pixelsPerTick
                }
                title={yLabel}
                titleOffset={yAxisTitleOffset}
              />
              <g transform={`translate(0, ${boundsHeight})`}>
                <AxisBottom xScale={xScale} width={boundsWidth} />
              </g>
            </g>
          </svg>
        </div>
        {!enableInteractions && (
          <div className="text-xs text-muted-foreground mt-2 text-center">
            Point interactions disabled for performance (
            {validSpecimens.length.toLocaleString()} points)
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
