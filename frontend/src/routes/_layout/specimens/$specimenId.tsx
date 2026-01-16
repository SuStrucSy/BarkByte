import { useSpecimensReadSpecimen } from "@/api/endpoints/specimens/specimens.gen";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
  ItemFooter,
  ItemMedia,
  ItemHeader
} from "@/components/ui/item"
import {
	Label,
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
	RadialBar,
	RadialBarChart,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { ExternalLinkIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator";
import { createFileRoute, Link } from "@tanstack/react-router";
import { LabelValue } from "@/components/Common/LabelValue";

export const Route = createFileRoute("/_layout/specimens/$specimenId")({
	staticData: {
		title: "Specimen Details",
	},
	component: SpecimenDetails,
});

function SpecimenDetails() {
	const { specimenId } = Route.useParams();
	const { data, isLoading, isError, error } =
		useSpecimensReadSpecimen(specimenId);
	const renderValue = (value: unknown) => {
		if (value === null || value === undefined || value === "") {
			return "—";
		}
		if (typeof value === "boolean") {
			return value ? "Yes" : "No";
		}
		return String(value);
	};
	const renderLabels = (items?: { label: string }[]) =>
		items?.length ? items.map((item) => item.label).join(", ") : "—";
	if (isLoading) {
		return <div>Loading specimen...</div>;
	}

	if (isError) {
		return (
			<div>
				Failed to load specimen: {error?.message ?? "Unknown error"}
			</div>
		);
	}

	if (!data) {
		return <div>Specimen not found.</div>;
	}

	const chartConfig = {
		value: {
			label: "Value",
			color: "var(--chart-3)",
		},
	} satisfies ChartConfig;

	const moistureChartConfig = {
		moisture: {
			label: "Moisture",
			color: "var(--chart-2)",
		},
	} satisfies ChartConfig;

	// Normalization ranges for each metric
	// These ranges are based on the databases' known 5th and 95th percentile values
	const metricRanges: Record<string, { min: number; max: number }> = {
		"Max Force": { min: 6.9, max: 382.3 },
		"Max Displacement": { min: 3.7, max: 47.4 },
		Stiffness: { min: 0.86, max: 131 },
		"Ultimate Force": { min: 5.5, max: 336.8 },
		"Ultimate Displacement": { min: 7.1, max: 63.8 },
		"Yield Force": { min: 5, max: 320.5 },
		"Yield Displacement": { min: 1.2, max: 20.2 },
		Ductility: { min: 5.5, max: 336.8 },
	};

	const normalizeMetric = (metric: string, rawValue: number) => {
		const range = metricRanges[metric];
		if (!range || range.max <= range.min) {
			return 0;
		}
		const normalized = (rawValue - range.min) / (range.max - range.min);
		return Math.max(0, Math.min(1, normalized));
	};

	const chartData = [
		{
			metric: "Max Force",
			value: normalizeMetric("Max Force", Number(data.e_max_force ?? 0)),
			rawValue: Number(data.e_max_force ?? 0),
		},
		{
			metric: "Max Displacement",
			value: normalizeMetric(
				"Max Displacement",
				Number(data.e_max_displacement ?? 0),
			),
			rawValue: Number(data.e_max_displacement ?? 0),
		},
		{
			metric: "Stiffness",
			value: normalizeMetric("Stiffness", Number(data.e_stiffness ?? 0)),
			rawValue: Number(data.e_stiffness ?? 0),
		},
		{
			metric: "Ultimate Force",
			value: normalizeMetric(
				"Ultimate Force",
				Number(data.e_ultimate_force ?? 0),
			),
			rawValue: Number(data.e_ultimate_force ?? 0),
		},
		{
			metric: "Ultimate Displacement",
			value: normalizeMetric(
				"Ultimate Displacement",
				Number(data.e_ultimate_displacement ?? 0),
			),
			rawValue: Number(data.e_ultimate_displacement ?? 0),
		},
		{
			metric: "Yield Force",
			value: normalizeMetric("Yield Force", Number(data.e_yield_force ?? 0)),
			rawValue: Number(data.e_yield_force ?? 0),
		},
		{
			metric: "Yield Displacement",
			value: normalizeMetric(
				"Yield Displacement",
				Number(data.e_yield_displacement ?? 0),
			),
			rawValue: Number(data.e_yield_displacement ?? 0),
		},
		{
			metric: "Ductility",
			value: normalizeMetric("Ductility", Number(data.e_ductility ?? 0)),
			rawValue: Number(data.e_ductility ?? 0),
		},
	];

	const moistureValue = Number(
		String(data.moisture_percentage ?? "").replace("%", ""),
	);
	const moistureChartData = [
		{
			name: "Moisture",
			moisture: Number.isFinite(moistureValue) ? moistureValue : 0,
		},
	];

	console.log(data)

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-4xl font-semibold">
						{data.specimen_reference_id ?? data.id}
					</h1>
				</div>
				<Button variant="outline" asChild>
					<Link to="/specimens">Back to specimens</Link>
				</Button>
			</div>
			<div className="grid gap-6 text-sm">
				<Card>
					<CardHeader>
						<CardTitle className="text-2xl">Meta Data</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-4 md:grid-cols-[2fr_auto_1fr] md:items-start">
						<div className="grid gap-3">
							<h3 className="text-xl font-semibold tracking-tight text-foreground">
								Specimen Information
							</h3>
							<div className="grid gap-4 md:grid-cols-2">
								<div className="grid gap-2">
									<LabelValue label="Assembly Type" value={renderValue(data.assembly_type)} />
									<LabelValue label="Joinery Type" value={renderValue(data.joinery_type.label)} />
									<LabelValue label="Sub Joinery Type" value={renderValue(data.sub_joinery_type.label)} />
									<LabelValue label="Fastener Types" value={renderLabels(data.fastener_types)} />
									<LabelValue label="Loading Directions" value={renderLabels(data.loading_directions)} />
									<LabelValue label="Practice" value={renderValue(data.practice)} />
								</div>
								<div className="grid gap-2">
									<LabelValue label="Fastener Numbers" value={renderValue(data.fastener_numbers)} />
									<LabelValue label="Connector Present" value={renderValue(data.connector)} />
									<LabelValue label="Dowel Present" value={renderValue(data.dowel)} />
									<LabelValue label="Replicate Tests" value={renderValue(data.replicate_tests)} />
									<LabelValue label="Connection Description" value={renderValue(data.connection_description)} />
									<LabelValue label="Note" value={renderValue(data.note)} />
								</div>
							</div>
						</div>
						<Separator
							orientation="vertical"
							className="hidden md:block"
						/>
						<div className="grid gap-2">
							<h3 className="text-xl font-semibold tracking-tight text-foreground">
								Identification Information
							</h3>
							<Item variant="outline" asChild>
								<div>
									<ItemContent>
										<ItemTitle>Specimen ID</ItemTitle>
										<ItemDescription>{data.id}</ItemDescription>
									</ItemContent>
								</div>
							</Item>

							<Item variant="outline" asChild>
								<Link
									to="/doi/$doiId"
									params={{ doiId: data.doi.id }}
									target="_blank"
									className="block"
								>
									<ItemContent>
										<ItemTitle>View DOI</ItemTitle>
										<ItemDescription>
											{data.doi.ref_title}
										</ItemDescription>
									</ItemContent>
									<ItemActions>
										<ExternalLinkIcon className="size-4" />
									</ItemActions>
								</Link>
							</Item>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle className="text-2xl">Structural Data</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-4 md:grid-cols-[1fr_auto_2fr] md:items-start">
						<div className="grid gap-2">
							<h3 className="text-xl font-semibold tracking-tight text-foreground">
								Geometric Properties
							</h3>
							<LabelValue label="Element Dimension" value={renderValue(data.element_dimension)} />
							<div className="flex flex-col gap-1">
								<ChartContainer
									config={moistureChartConfig}
									className="mx-auto h-[220px] w-full"
								>
									<RadialBarChart
										data={moistureChartData}
										startAngle={0}
										endAngle={250}
										innerRadius={80}
										outerRadius={110}
									>
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
										<PolarRadiusAxis
											tick={false}
											tickLine={false}
											axisLine={false}
										>
											<Label
												content={({ viewBox }) => {
													if (
														viewBox &&
														"cx" in viewBox &&
														"cy" in viewBox
													) {
														return (
															<text
																x={viewBox.cx}
																y={viewBox.cy}
																textAnchor="middle"
																dominantBaseline="middle"
															>
																<tspan className="fill-foreground text-3xl font-bold">
																	{moistureChartData[0]?.moisture ?? 0}%
																</tspan>
																<tspan
																	x={viewBox.cx}
																	y={(viewBox.cy || 0) + 22}
																	className="fill-muted-foreground"
																>
																	Moisture
																</tspan>
															</text>
														);
													}
													return null;
												}}
											/>
										</PolarRadiusAxis>
									</RadialBarChart>
								</ChartContainer>
							</div>
						</div>
						<Separator />
						<div className="grid gap-2">
							<h3 className="text-xl font-semibold tracking-tight text-foreground">
								Material Properties
							</h3>
							<LabelValue label="Wood Type" value={renderValue(data.wood_type)} />
							<LabelValue label="Wood Mechanical Properties" value={renderValue(data.wood_mechanical_properties)} />
							<LabelValue label="Fastener Mechanical Properties" value={renderValue(data.fastener_mechanical_properties)} />
							<LabelValue label="Connector Mechanical Properties" value={renderValue(data.connector_mechanical_properties)} />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle className="text-2xl">Experimental Data</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-6 md:grid-cols-2 md:items-start">
						<div className="grid gap-2">
							<h3 className="text-xl font-semibold tracking-tight text-foreground">
								Experimental Results
							</h3>
							<LabelValue label="Experiment Date" value={renderValue(data.e_date)} />
							<LabelValue label="Test Loading Type" value={renderValue(data.e_test_loading_type)} />
							<LabelValue label="Measurement Unit" value={renderValue(data.e_measurement_unit)} />
							<LabelValue label="Yield Point Method" value={renderValue(data.e_yield_point_method)} />
							<LabelValue label="Note" value={renderValue(data.note)} />
							<Separator />
							<div className="grid gap-2">
								<h3 className="text-xl font-semibold tracking-tight text-foreground">
									Qualitative Failure Measures
								</h3>
								<LabelValue label="Failure Modes" value={renderLabels(data.e_qualitative_failure_measure)} />
								<LabelValue label="QFM Description" value={renderValue(data.e_qfm_description)} />
							</div>
						</div>
						<div className="grid gap-6">
							<div className="grid gap-2">
								<h3 className="text-xl font-semibold tracking-tight text-foreground">
									Quantitative Mechanical Measures
								</h3>
								<ChartContainer
									config={chartConfig}
									className="mx-auto h-[280px] w-full"
								>
									<RadarChart data={chartData}>
										<ChartTooltip
											cursor={false}
											content={
												<ChartTooltipContent
													formatter={(_, name, item) => {
														const raw = (item?.payload as { rawValue?: number })
															?.rawValue;
														const color = item?.color ?? item?.fill;

														return (
															<div className="flex items-center gap-2">
																<span
																	className="h-2 w-2 rounded-sm"
																	style={{ backgroundColor: color }}
																/>
																<div className="flex flex-col">
																	<span className="text-xs text-muted-foreground">
																		{name}
																	</span>
																	<span className="font-medium">
																		{raw ?? "—"}
																	</span>
																</div>
															</div>
														);
													}}
												/>
											}
										/>
										<PolarAngleAxis dataKey="metric" />
										<PolarGrid />
										<PolarRadiusAxis
											domain={[0, 1]}
											tick={false}
											axisLine={false}
										/>
										<Radar
											dataKey="value"
											fill="var(--color-value)"
											fillOpacity={0.6}
											stroke="var(--color-value)"
										/>
									</RadarChart>
								</ChartContainer>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
			{/* <Separator className="my-10" />
			<pre className="rounded-md bg-muted p-4 text-xs overflow-x-auto whitespace-pre-wrap break-words max-w-full">
				{JSON.stringify(data, null, 2)}
			</pre> */}
		</div>
	);
}
