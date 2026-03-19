import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ItemCount } from "@/lib/utils";
import { Pie, PieChart, type PieLabelRenderProps } from "recharts";

interface DonutProps {
  counts: Record<string, ItemCount>;
}

const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  name,
}: PieLabelRenderProps) => {
  if (
    cx === null ||
    cy === null ||
    innerRadius === null ||
    outerRadius === null ||
    midAngle === undefined
  ) {
    return null;
  }
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + outerRadius * 0.7;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#e76034"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {name}
    </text>
  );
};

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
          label={renderCustomLabel}
          nameKey="label"
          innerRadius="35%"
          outerRadius="65%"
          cx="50%"
          cy="50%"
        />
      </PieChart>
    </ChartContainer>
  );
}
