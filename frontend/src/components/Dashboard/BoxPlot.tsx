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

const MARGIN = { top: 30, right: 30, bottom: 30, left: 50 };
const JITTER_WIDTH = 40;

interface BoxPlotProps {
  selectedSpecimens: SpecimenPublic[];
  yKey: keyof SpecimenPublic;
  yLabel: string;
  onPointClick?: (specimen: SpecimenPublic) => void;
  mirrorPosition?: number;
  smoothing?: boolean;
}

// Individual point component with tooltip and hover
function DataPoint({
  specimen,
  cx,
  cy,
  yKey,
  onPointClick,
}: {
  specimen: SpecimenPublic;
  cx: number;
  cy: number;
  yKey: keyof SpecimenPublic;
  onPointClick?: (specimen: SpecimenPublic) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <circle
          cx={cx}
          cy={cy}
          r={isHovered ? 4 : 3}
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
        />
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs">
        <div className="space-y-2">
          <div className="font-semibold text-sm">
            {specimen.specimen_reference_id || "N/A"}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <span className="text-muted-foreground">{yKey}:</span>
            <span className="font-mono">
              {(specimen[yKey] as number)?.toFixed(2)}
            </span>

            {specimen.e_ductility != null && (
              <>
                <span className="text-muted-foreground">Ductility:</span>
                <span className="font-mono">
                  {specimen.e_ductility.toFixed(2)}
                </span>
              </>
            )}

            {specimen.e_yield_force != null && (
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

  // The bounds (= area inside the axis) is calculated by substracting the margins from total width / height
  const boundsWidth = useMemo(() => {
    return dimensions.width - MARGIN.right - MARGIN.left;
  }, [dimensions.width]);
  const boundsHeight = useMemo(() => {
    return dimensions.height - MARGIN.top - MARGIN.bottom;
  }, [dimensions.height]);

  // Compute everything derived from the dataset:
  const { chartMin, chartMax, groups } = useMemo(() => {
    const groups = [
      ...new Set(selectedSpecimens.map((s) => s.joinery_type?.label)),
    ];

    const allStats = groups.map((group) => {
      const groupData = selectedSpecimens
        .filter((s) => s.joinery_type?.label === group)
        .map((s) => s[yKey] as number);

      const sumStats = getSummaryStats(groupData);

      if (!sumStats) {
        return null;
      }

      return sumStats;
    });

    const minMaxValues = allStats
      .filter((stat) => stat !== null)
      .flatMap((stat) => [stat.min, stat.max]);

    const [chartMin, chartMax] = d3.extent(minMaxValues) as [number, number];

    return { chartMin, chartMax, groups };
  }, [selectedSpecimens, yKey]);

  // Compute scales
  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([chartMin, chartMax])
      .range([boundsHeight, 0])
      .nice();
  }, [chartMin, chartMax, boundsHeight]);
  const xScale = useMemo(() => {
    return d3.scaleBand().range([0, boundsWidth]).domain(groups).padding(0.15);
  }, [boundsWidth, groups]);

  const colorScale = useMemo(() => {
    const colors = getChartColors();
    return d3.scaleOrdinal<string>().domain(groups).range(colors);
  }, [groups]);

  // Build the box shapes
  const allBoxes = useMemo(() => {
    return groups.map((group, i) => {
      const groupSpecimens = selectedSpecimens.filter(
        (s) => s.joinery_type?.label === group,
      );
      const groupData = groupSpecimens.map((s) => s[yKey] as number);

      const sumStats = getSummaryStats(groupData);

      if (!sumStats) {
        return null;
      }

      const { min, q1, median, q3, max } = sumStats;

      return (
        <div
          key={i}
          style={{
            position: "absolute",
            top: 0,
            width: xScale.bandwidth(),
            height: boundsHeight,
            left: xScale(group),
            opacity: mirrorPosition === 0 ? 1 : 0,
          }}
        >
          <svg height={boundsHeight} width={xScale.bandwidth()}>
            <VerticalBox
              width={xScale.bandwidth()}
              q1={yScale(q1)}
              median={yScale(median)}
              q3={yScale(q3)}
              min={yScale(min)}
              max={yScale(max)}
              stroke="currentcolor"
              fill={colorScale(group)}
            />
            <TooltipProvider delayDuration={100}>
              {groupSpecimens.map((specimen, idx) => {
                const value = specimen[yKey] as number;
                return (
                  <DataPoint
                    key={idx}
                    specimen={specimen}
                    cx={
                      xScale.bandwidth() / 2 -
                      JITTER_WIDTH / 2 +
                      Math.random() * JITTER_WIDTH
                    }
                    cy={yScale(value)}
                    yKey={yKey}
                    onPointClick={onPointClick}
                  />
                );
              })}
            </TooltipProvider>
          </svg>
        </div>
      );
    });
  }, [
    boundsHeight,
    colorScale,
    groups,
    mirrorPosition,
    onPointClick,
    selectedSpecimens,
    xScale,
    yKey,
    yScale,
  ]);

  //
  // Violins (with variable width for mirror move)
  //
  const allViolins = useMemo(() => {
    return groups.map((group, i) => {
      const groupData = selectedSpecimens
        .filter((s) => s.joinery_type?.label === group)
        .map((s) => s[yKey] as number);
      return (
        <div key={i}>
          <div
            style={{
              position: "absolute",
              top: 0,
              width: mirrorPosition * xScale.bandwidth(),
              height: boundsHeight,
              left: xScale(group),
              overflow: "hidden",
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
        </div>
      );
    });
  }, [
    boundsHeight,
    colorScale,
    groups,
    mirrorPosition,
    selectedSpecimens,
    smoothing,
    xScale,
    yKey,
    yScale,
  ]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      <div
        style={{
          position: "relative",
          width: dimensions.width,
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
              transform: `translate(${MARGIN.left}px, ${MARGIN.top}px)`,
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
        >
          <g
            width={boundsWidth}
            height={boundsHeight}
            transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
            style={{ color: "hsl(var(--foreground))" }}
          >
            <AxisLeft yScale={yScale} pixelsPerTick={30} title={yLabel} />
            <g transform={`translate(0, ${boundsHeight})`}>
              <AxisBottom xScale={xScale} />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
