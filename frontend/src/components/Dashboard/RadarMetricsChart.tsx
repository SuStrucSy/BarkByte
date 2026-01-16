import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
  value: {
    label: "Value",
  },
} satisfies ChartConfig

type RadarMetricsChartProps = {
  data: Array<{
    metric: string
    value: number
    rawValue?: number
  }>
  className?: string
}

export function RadarMetricsChart({
  data,
  className,
}: RadarMetricsChartProps) {
  return (
    <ChartContainer
      config={chartConfig}
      className={["mx-auto h-[280px] w-full", className]
        .filter(Boolean)
        .join(" ")}
    >
      <RadarChart data={data}>
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(_, __, item) => {
                const raw = (item?.payload as { rawValue?: number })?.rawValue
                const color = item?.color ?? item?.fill

                return (
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-sm"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        {item?.payload?.metric}
                      </span>
                      <span className="font-medium">{raw ?? "—"}</span>
                    </div>
                  </div>
                )
              }}
            />
          }
        />
        <PolarAngleAxis dataKey="metric" />
        <PolarGrid />
        <PolarRadiusAxis domain={[0, 1]} tick={false} axisLine={false} />
        <Radar
          dataKey="value"
          fill="var(--color-value)"
          fillOpacity={0.6}
          stroke="var(--color-value)"
        />
      </RadarChart>
    </ChartContainer>
  )
}