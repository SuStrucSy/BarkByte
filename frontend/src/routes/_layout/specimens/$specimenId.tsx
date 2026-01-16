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
  ItemTitle
} from "@/components/ui/item"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ExternalLinkIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator";
import { createFileRoute, Link } from "@tanstack/react-router";
import { LabelValue } from "@/components/Common/LabelValue";
import { MoistureDial } from "@/components/Dashboard/MoistureDial";
import { RadarMetricsChart } from "@/components/Dashboard/RadarMetricsChart";

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

	const moistureValue = Number(
		String(data.moisture_percentage ?? "").replace("%", ""),
	);
	const moistureChartData = [
		{
			name: "Moisture",
			moisture: Number.isFinite(moistureValue) ? moistureValue : 0,
		},
	];

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
				<Tabs defaultValue="Meta Data">
					<TabsList>
						<TabsTrigger value="Meta Data">Meta Data</TabsTrigger>
						<TabsTrigger value="Structural Data">Structural Data</TabsTrigger>
						<TabsTrigger value="Experimental Data">Experimental Data</TabsTrigger>
					</TabsList>
					<TabsContent value="Meta Data">
						<Card>
							<CardHeader>
								<CardTitle className="text-2xl">Meta Data</CardTitle>
							</CardHeader>
							<CardContent className="grid gap-4 md:grid-cols-[2fr_auto_1fr] md:items-start">
								<div className="grid gap-3">
									<h3 className="text-xl font-semibold tracking-tight text-foreground">Specimen Information</h3>
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
								<Separator orientation="vertical" className="hidden md:block"/>
								<div className="grid gap-2">
									<h3 className="text-xl font-semibold tracking-tight text-foreground">Identification Information</h3>
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
					</TabsContent>
					<TabsContent value="Structural Data">
						<Card>
							<CardHeader>
								<CardTitle className="text-2xl">Structural Data</CardTitle>
							</CardHeader>
							<CardContent className="grid gap-4 md:grid-cols-[1fr_auto_2fr] md:items-start">
								<div className="grid gap-2">
									<h3 className="text-xl font-semibold tracking-tight text-foreground">Geometric Properties</h3>
									<LabelValue label="Element Dimension" value={renderValue(data.element_dimension)} />
									<MoistureDial value={moistureChartData[0].moisture} label="Moisture Percentage" className="max-w-[200px]" />
								</div>
								<Separator orientation="vertical" className="hidden md:block"/>
								<div className="grid gap-2">
									<h3 className="text-xl font-semibold tracking-tight text-foreground">Material Properties</h3>
									<LabelValue label="Wood Type" value={renderValue(data.wood_type)} />
									<LabelValue label="Wood Mechanical Properties" value={renderValue(data.wood_mechanical_properties)} />
									<LabelValue label="Fastener Mechanical Properties" value={renderValue(data.fastener_mechanical_properties)} />
									<LabelValue label="Connector Mechanical Properties" value={renderValue(data.connector_mechanical_properties)} />
								</div>
							</CardContent>
						</Card>
					</TabsContent>
					<TabsContent value="Experimental Data">
						<Card>
							<CardHeader>
								<CardTitle className="text-2xl">Experimental Data</CardTitle>
							</CardHeader>
							<CardContent className="grid gap-6 md:grid-cols-2 md:items-start">
								<div className="grid gap-2">
									<h3 className="text-xl font-semibold tracking-tight text-foreground">Experimental Results</h3>
									<LabelValue label="Experiment Date" value={renderValue(data.e_date)} />
									<LabelValue label="Test Loading Type" value={renderValue(data.e_test_loading_type)} />
									<LabelValue label="Measurement Unit" value={renderValue(data.e_measurement_unit)} />
									<LabelValue label="Yield Point Method" value={renderValue(data.e_yield_point_method)} />
									<LabelValue label="Note" value={renderValue(data.note)} />
									
									<div className="grid gap-2">
										<h3 className="text-xl font-semibold tracking-tight text-foreground">Qualitative Failure Measures</h3>
										<LabelValue label="Failure Modes" value={renderLabels(data.e_qualitative_failure_measure)} />
										<LabelValue label="QFM Description" value={renderValue(data.e_qfm_description)} />
									</div>
								</div>
								<div className="grid gap-6">
									<div className="grid gap-2">
										<h3 className="text-xl font-semibold tracking-tight text-foreground">Quantitative Mechanical Measures</h3>
										<RadarMetricsChart data={data} />
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
			{/* <Separator className="my-10" />
			<pre className="rounded-md bg-muted p-4 text-xs overflow-x-auto whitespace-pre-wrap break-words max-w-full">
				{JSON.stringify(data, null, 2)}
			</pre> */}
		</div>
	);
}
