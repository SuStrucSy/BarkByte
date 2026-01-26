import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart, PolarAngleAxis } from "recharts"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"

type MoistureDialProps = {
  value: number
  label?: string
  className?: string
}

const config = {
  moisture: {
    label: "Moisture"
  },
} satisfies ChartConfig

export function MoistureDial({ value, label = "Moisture", className }: MoistureDialProps) {
  const v = Math.max(0, Math.min(100, value))
  const data = [{ moisture: v }]

  return (
    <div className={["flex flex-col gap-1", className].filter(Boolean).join(" ")}>
        <ChartContainer config={config} className="mx-auto h-[220px] w-full">
            <RadialBarChart
            data={data}
            startAngle={0}
            endAngle={360}
            innerRadius={80}
            outerRadius={110}
            >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <PolarGrid
                gridType="circle"
                radialLines={false}
                stroke="none"
                className="first:fill-muted last:fill-background"
                polarRadius={[86, 74]}
                />
                <RadialBar
                dataKey="moisture"
                fill="var(--color-moisture)"
                background
                cornerRadius={10}
                />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                    <Label
                        content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                            <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor="middle"
                                dominantBaseline="middle"
                            >
                                <tspan className="fill-foreground text-3xl font-bold">
                                {Math.round(v)}%
                                </tspan>
                                <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 22}
                                className="fill-muted-foreground"
                                >
                                {label}
                                </tspan>
                            </text>
                            )
                        }
                        return null
                        }}
                    />
                </PolarRadiusAxis>
            </RadialBarChart>
        </ChartContainer>
    </div>
  )
}