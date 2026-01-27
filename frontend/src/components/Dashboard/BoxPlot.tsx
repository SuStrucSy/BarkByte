import type { SpecimenPublic } from "@/api/model";
import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { VerticalBox } from "./VerticalBox";
import { AxisLeft } from "./AxisLeft";
import { AxisBottom } from "./AxisBottomCategoric";
import { VerticalViolinShape } from "./VerticalViolinShape";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { getChartColors, getSummaryStats } from "@/lib/utils";
import { isNumericValue } from "@/lib/typeGuards";
import { CHART_CONFIG } from "@/components/Charts/chartConfig";
import useDebounce from "@/hooks/use-debounce";

interface BoxPlotProps {
  selectedSpecimens: SpecimenPublic[];
  yKey: keyof SpecimenPublic;
  yLabel: string;
  onPointClick?: (specimen: SpecimenPublic) => void;
  mirrorPosition?: number;
  smoothing?: boolean;
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
          className={isHovered ? "fill-foreground" : "fill-muted-foreground"}
          stroke="currentColor"
          strokeOpacity={isHovered ? 0.6 : 0.2}
          fillOpacity={isHovered ? 0.8 : 0.3}
          style={{
            cursor: onPointClick ? "pointer" : "default",
            transition: "all 0.2s ease",
            color: "hsl(var(--foreground))",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => onPointClick?.(specimen)}
          aria-label={`Data point: ${specimen.specimen_reference_id || "Unknown"}`}
          role={onPointClick ? "button" : "presentation"}
          tabIndex={onPointClick ? 0 : -1}
        />
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs">
        <div className="space-y-2">
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
                <span className="text-muted-foreground">Ductility:</span>
                <span className="font-mono">
                  {specimen.e_ductility.toFixed(2)}
                </span>
              </>
            )}

            {isNumericValue(specimen.e_yield_force) && (
              <>
                <span className="text-muted-foreground">Yield Force:</span>
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
        </div>
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
  smoothing = false,
}: BoxPlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  // Filter valid specimens once
  const validSpecimens = useMemo(() => {
    return selectedSpecimens.filter(
      (s) => s.joinery_type?.label && isNumericValue(s[yKey]),
    );
  }, [selectedSpecimens, yKey]);

  const jitterMap = useStableJitter(validSpecimens);

  const boundsWidth = useMemo(() => {
    return (
      dimensions.width - CHART_CONFIG.margins.right - CHART_CONFIG.margins.left
    );
  }, [dimensions.width]);

  const boundsHeight = useMemo(() => {
    return (
      dimensions.height - CHART_CONFIG.margins.top - CHART_CONFIG.margins.bottom
    );
  }, [dimensions.height]);

  // Compute chart data with proper error handling
  const chartData = useMemo(() => {
    const groups = [
      ...new Set(validSpecimens.map((s) => s.joinery_type!.label)),
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
            <svg height={boundsHeight} width={bandwidth}>
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
                <g role="group" aria-label={`Data points for ${group}`}>
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
            <svg height={boundsHeight} width={xScale.bandwidth()}>
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

    return () => {
      resizeObserver.disconnect();
    };
  }, [debouncedWindowSize]);

  // Empty state
  if (validSpecimens.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground h-full min-h-[400px]"
        role="status"
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
        className="w-full h-full min-h-[400px]"
        role="img"
        aria-label={`Box plot showing ${yLabel} distribution across ${chartData.groups.length} groups`}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: dimensions.height,
          }}
        >
          <div
            style={{
              width: dimensions.width,
              height: dimensions.height,
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            <div
              style={{
                width: boundsWidth,
                height: boundsHeight,
                transform: `translate(${CHART_CONFIG.margins.left}px, ${CHART_CONFIG.margins.top}px)`,
              }}
            >
              {allBoxes}
              {allViolins}
            </div>
          </div>
          <svg
            width={dimensions.width}
            height={dimensions.height}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              pointerEvents: "none",
            }}
            className="text-foreground"
            aria-hidden="true"
          >
            <g
              width={boundsWidth}
              height={boundsHeight}
              transform={`translate(${CHART_CONFIG.margins.left}, ${CHART_CONFIG.margins.top})`}
              style={{ color: "hsl(var(--foreground))" }}
            >
              <AxisLeft
                yScale={yScale}
                pixelsPerTick={CHART_CONFIG.pixelsPerTick}
                title={yLabel}
              />
              <g transform={`translate(0, ${boundsHeight})`}>
                <AxisBottom xScale={xScale} />
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
