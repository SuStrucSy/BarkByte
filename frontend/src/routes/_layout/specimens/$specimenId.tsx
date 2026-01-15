import { useSpecimensReadSpecimen } from "@/api/endpoints/specimens/specimens.gen";
import { Button } from "@/components/ui/button";
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
				<section className="grid gap-3">
					<h2 className="text-2xl font-semibold">Meta Data</h2>
					<div className="grid gap-2">
						<h3 className="text-xl font-semibold tracking-tight text-foreground">Identification Information</h3>
						<div>
							<span className="font-medium">Specimen ID:</span>{" "}
							{renderValue(data.id)}
						</div>
						<div>
							<span className="font-medium">DOI:</span>{" "}
							{data.doi?.id ? (
								<Link
								to="/doi/$doiId"
								params={{ doiId: data.doi.id }}
								className="text-primary underline hover:opacity-80"
								>
								{data.doi.ref_title ?? "View DOI"}
								</Link>
							) : (
								<span className="text-muted-foreground">N/A</span>
							)}
						</div>
					</div>
					<br/>
					<div className="grid gap-2">
						<h3 className="text-xl font-semibold tracking-tight text-foreground">Specimen Information</h3>
						<div>
							<span className="font-medium">Assembly Type:</span>{" "}
							{renderValue(data.assembly_type)}
						</div>
						<div>
							<span className="font-medium">Joinery Type:</span>{" "}
							{renderValue(data.joinery_type?.label)}
						</div>
						<div>
							<span className="font-medium">Sub Joinery Type:</span>{" "}
							{renderValue(data.sub_joinery_type?.label)}
						</div>
						<div>
							<span className="font-medium">Practice:</span>{" "}
							{renderValue(data.practice)}
						</div>
						<div>
							<span className="font-medium">Loading Directions:</span>{" "}
							{renderLabels(data.loading_directions)}
						</div>
						<div>
							<span className="font-medium">Connection Description:</span>{" "}
							{renderValue(data.connection_description)}
						</div>
						<div>
							<span className="font-medium">Fastener Types:</span>{" "}
							{renderLabels(data.fastener_types)}
						</div>
						<div>
							<span className="font-medium">Fastener Numbers:</span>{" "}
							{renderValue(data.fastener_numbers)}
						</div>
						<div>
							<span className="font-medium">Connector Present:</span>{" "}
							{renderValue(data.connector)}
						</div>
						<div>
							<span className="font-medium">Dowel Present:</span>{" "}
							{renderValue(data.dowel)}
						</div>
						<div>
							<span className="font-medium">Replicate Tests:</span>{" "}
							{renderValue(data.replicate_tests)}
						</div>
					</div>
				</section>
				<hr className="my-6 border-muted" />
				<section className="grid gap-3">
					<h2 className="text-2xl font-semibold">Structural Data</h2>
					<div className="grid gap-2">
						<h3 className="text-xl font-semibold tracking-tight text-foreground">Geometric Properties</h3>
						<div>
							<span className="font-medium">Element Dimension:</span>{" "}
							{renderValue(data.element_dimension)}
						</div>
					</div>
					<br/>
					<div className="grid gap-2">
						<h3 className="text-xl font-semibold tracking-tight text-foreground">Material Properties</h3>
						<div>
							<span className="font-medium">Wood Type:</span>{" "}
							{renderValue(data.wood_type)}
						</div>
						<div>
							<span className="font-medium">Moisture Percentage:</span>{" "}
							{renderValue(data.moisture_percentage)}
						</div>
						<div>
							<span className="font-medium">Wood Mechanical Properties:</span>{" "}
							{renderValue(data.wood_mechanical_properties)}
						</div>
						<div>
							<span className="font-medium">Fastener Mechanical Properties:</span>{" "}
							{renderValue(data.fastener_mechanical_properties)}
						</div>
						<div>
							<span className="font-medium">Connector Mechanical Properties:</span>{" "}
							{renderValue(data.connector_mechanical_properties)}
						</div>
					</div>
				</section>
				<hr className="my-6 border-muted" />
				<section className="grid gap-3">
					<h2 className="text-2xl font-semibold">Experimental Data</h2>
					<div className="grid gap-2">
						<h3 className="text-xl font-semibold tracking-tight text-foreground">Experimental Results</h3>
						<div>
							<span className="font-medium">Experiment Date:</span>{" "}
							{renderValue(data.e_date)}
						</div>
						<div>
							<span className="font-medium">Test Loading Type:</span>{" "}
							{renderValue(data.e_test_loading_type)}
						</div>
						<div>
							<span className="font-medium">Measurement Unit:</span>{" "}
							{renderValue(data.e_measurement_unit)}
						</div>
						<div>
							<span className="font-medium">Yield Point Method:</span>{" "}
							{renderValue(data.e_yield_point_method)}
						</div>
						<div>
							<span className="font-medium">Note:</span>{" "}
							{renderValue(data.note)}
						</div>
					</div>
					<br/>
					<div className="grid gap-2">
						<h3 className="text-xl font-semibold tracking-tight text-foreground">Quantitative Mechanical Measures</h3>
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
					<br/>
					<div className="grid gap-2">
						<h3 className="text-xl font-semibold tracking-tight text-foreground">Qualitative Failure Measures</h3>
						<div>
							<span className="font-medium">Failure Modes:</span>{" "}
							{renderLabels(data.e_qualitative_failure_measure)}
						</div>
						<div>
							<span className="font-medium">QFM Description:</span>{" "}
							{renderValue(data.e_qfm_description)}
						</div>
					</div>
				</section>
			</div>
			<hr className="my-6 border-muted" />
			<pre className="rounded-md bg-muted p-4 text-xs overflow-x-auto whitespace-pre-wrap break-words max-w-full">
				{JSON.stringify(data, null, 2)}
			</pre>
		</div>
	);
}
