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
import { ExternalLinkIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator";
import { createFileRoute, Link } from "@tanstack/react-router";

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
									<div className="flex flex-col gap-1">
										<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
											Assembly Type
										</span>
										<span className="font-medium">
											{renderValue(data.assembly_type)}
										</span>
									</div>
									<div className="flex flex-col gap-1">
										<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
											Joinery Type
										</span>
										<span className="font-medium">
											{renderValue(data.joinery_type?.label)}
										</span>
									</div>
									<div className="flex flex-col gap-1">
										<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
											Sub Joinery Type
										</span>
										<span className="font-medium">
											{renderValue(data.sub_joinery_type?.label)}
										</span>
									</div>
									<div className="flex flex-col gap-1">
										<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
											Fastener Types
										</span>
										<span className="font-medium">
											{renderLabels(data.fastener_types)}
										</span>
									</div>
									<div className="flex flex-col gap-1">
										<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
											Loading Directions
										</span>
										<span className="font-medium">
											{renderLabels(data.loading_directions)}
										</span>
									</div>
									<div className="flex flex-col gap-1">
										<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
											Practice
										</span>
										<span className="font-medium">
											{renderValue(data.practice)}
										</span>
									</div>
								</div>
								<div className="grid gap-2">
									<div className="flex flex-col gap-1">
										<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
											Fastener Numbers
										</span>
										<span className="font-medium">
											{renderValue(data.fastener_numbers)}
										</span>
									</div>
									<div className="flex flex-col gap-1">
										<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
											Connector Present
										</span>
										<span className="font-medium">
											{renderValue(data.connector)}
										</span>
									</div>
									<div className="flex flex-col gap-1">
										<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
											Dowel Present
										</span>
										<span className="font-medium">
											{renderValue(data.dowel)}
										</span>
									</div>
									<div className="flex flex-col gap-1">
										<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
											Replicate Tests
										</span>
										<span className="font-medium">
											{renderValue(data.replicate_tests)}
										</span>
									</div>
									<div className="flex flex-col gap-1">
										<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
											Connection Description
										</span>
										<span className="font-medium">
											{renderValue(data.connection_description)}
										</span>
									</div>
									<div className="flex flex-col gap-1">
										<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
											Note
										</span>
										<span className="font-medium">
											{renderValue(data.note)}
										</span>
									</div>
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
					<CardContent className="grid gap-4">
						<div className="grid gap-2">
							<h3 className="text-xl font-semibold tracking-tight text-foreground">
								Geometric Properties
							</h3>
							<div className="flex flex-col gap-1">
								<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
									Element Dimension
								</span>
								<span className="font-medium">
									{renderValue(data.element_dimension)}
								</span>
							</div>
						</div>
						<Separator />
						<div className="grid gap-2">
							<h3 className="text-xl font-semibold tracking-tight text-foreground">
								Material Properties
							</h3>
							<div className="flex flex-col gap-1">
								<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
									Wood Type
								</span>
								<span className="font-medium">
									{renderValue(data.wood_type)}
								</span>
							</div>
							<div className="flex flex-col gap-1">
								<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
									Moisture Percentage
								</span>
								<span className="font-medium">
									{renderValue(data.moisture_percentage)}
								</span>
							</div>
							<div className="flex flex-col gap-1">
								<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
									Wood Mechanical Properties
								</span>
								<span className="font-medium">
									{renderValue(data.wood_mechanical_properties)}
								</span>
							</div>
							<div className="flex flex-col gap-1">
								<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
									Fastener Mechanical Properties
								</span>
								<span className="font-medium">
									{renderValue(data.fastener_mechanical_properties)}
								</span>
							</div>
							<div className="flex flex-col gap-1">
								<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
									Connector Mechanical Properties
								</span>
								<span className="font-medium">
									{renderValue(data.connector_mechanical_properties)}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle className="text-2xl">Experimental Data</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-4">
						<div className="grid gap-2">
							<h3 className="text-xl font-semibold tracking-tight text-foreground">
								Experimental Results
							</h3>
							<div className="flex flex-col gap-1">
								<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
									Experiment Date
								</span>
								<span className="font-medium">
									{renderValue(data.e_date)}
								</span>
							</div>
							<div className="flex flex-col gap-1">
								<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
									Test Loading Type
								</span>
								<span className="font-medium">
									{renderValue(data.e_test_loading_type)}
								</span>
							</div>
							<div className="flex flex-col gap-1">
								<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
									Measurement Unit
								</span>
								<span className="font-medium">
									{renderValue(data.e_measurement_unit)}
								</span>
							</div>
							<div className="flex flex-col gap-1">
								<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
									Yield Point Method
								</span>
								<span className="font-medium">
									{renderValue(data.e_yield_point_method)}
								</span>
							</div>
							<div className="flex flex-col gap-1">
								<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
									Note
								</span>
								<span className="font-medium">
									{renderValue(data.note)}
								</span>
							</div>
						</div>
						<Separator />
						<div className="grid gap-2">
							<h3 className="text-xl font-semibold tracking-tight text-foreground">
								Quantitative Mechanical Measures
							</h3>
							<div>
								<span className="font-medium">Max Force:</span>{" "}
								{renderValue(data.e_max_force)}
							</div>
							<div>
								<span className="font-medium">Max Displacement:</span>{" "}
								{renderValue(data.e_max_displacement)}
							</div>
							<div>
								<span className="font-medium">Stiffness:</span>{" "}
								{renderValue(data.e_stiffness)}
							</div>
							<div>
								<span className="font-medium">Ultimate Force:</span>{" "}
								{renderValue(data.e_ultimate_force)}
							</div>
							<div>
								<span className="font-medium">Ultimate Displacement:</span>{" "}
								{renderValue(data.e_ultimate_displacement)}
							</div>
							<div>
								<span className="font-medium">Yield Force:</span>{" "}
								{renderValue(data.e_yield_force)}
							</div>
							<div>
								<span className="font-medium">Yield Displacement:</span>{" "}
								{renderValue(data.e_yield_displacement)}
							</div>
							<div>
								<span className="font-medium">Ductility:</span>{" "}
								{renderValue(data.e_ductility)}
							</div>
						</div>
						<Separator />
						<div className="grid gap-2">
							<h3 className="text-xl font-semibold tracking-tight text-foreground">
								Qualitative Failure Measures
							</h3>
							<div className="flex flex-col gap-1">
								<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
									Failure Modes
								</span>
								<span className="font-medium">
									{renderLabels(data.e_qualitative_failure_measure)}
								</span>
							</div>
							<div className="flex flex-col gap-1">
								<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
									QFM Description
								</span>
								<span className="font-medium">
									{renderValue(data.e_qfm_description)}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
			<Separator className="my-10" />
			<pre className="rounded-md bg-muted p-4 text-xs overflow-x-auto whitespace-pre-wrap break-words max-w-full">
				{JSON.stringify(data, null, 2)}
			</pre>
		</div>
	);
}
