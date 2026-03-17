import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ItemCount } from "@/lib/utils";
import { Pie, PieChart } from "recharts";

interface DonutProps {
  counts: Record<string, ItemCount>;
}

export function Donut({ counts }: DonutProps) {
  const chartData = Object.entries(counts).map(
    ([id, { label, count }], index, arr) => ({
      id,
      label,
      count,
      fill: `hsl(${Math.round((index / arr.length) * 360)}, 70%, 50%)`,
    }),
  );

  const chartConfig = Object.entries(counts).reduce<ChartConfig>(
    (acc, [, { label }], index, arr) => {
      const hue = Math.round((index / arr.length) * 360);
      acc[label] = {
        label,
        color: `hsl(${hue}, 70%, 50%)`,
      };
      return acc;
    },
    {},
  ) satisfies ChartConfig;

  return (
    <ChartContainer
      config={chartConfig}
      className="w-full max-h-87.5 [&_.recharts-pie-label-text]:fill-foreground"
    >
      <PieChart responsive>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Pie
          data={chartData}
          dataKey="count"
          label
          nameKey="label"
          innerRadius="35%"
          outerRadius="65%"
          cx="50%"
          cy="50%"
        />
        <ChartLegend
          content={({ payload }) => (
            <ChartLegendContent
              payload={payload}
              nameKey="label"
              className="flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          )}
        />
      </PieChart>
    </ChartContainer>
  );
}
