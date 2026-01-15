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
					<h1 className="text-2xl font-semibold">
						Specimen {data.specimen_reference_id ?? data.id}
					</h1>
					<p className="text-sm text-muted-foreground">ID: {data.id}</p>
				</div>
				<Button variant="outline" asChild>
					<Link to="/specimens">Back to specimens</Link>
				</Button>
			</div>

			<div className="grid gap-2 text-sm">
				<div>
					<span className="font-medium">Assembly Type:</span>{" "}
					{data.assembly_type ?? "—"}
				</div>
				<div>
					<span className="font-medium">Joinery Type:</span>{" "}
					{data.joinery_type?.label ?? "—"}
				</div>
				<div>
					<span className="font-medium">Sub Joinery Type:</span>{" "}
					{data.sub_joinery_type?.label ?? "—"}
				</div>
				<div>
					<span className="font-medium">Loading Directions:</span>{" "}
					{data.loading_directions?.length
						? data.loading_directions.map((item) => item.label).join(", ")
						: "—"}
				</div>
			</div>

			<pre className="rounded-md bg-muted p-4 text-xs overflow-auto">
				{JSON.stringify(data, null, 2)}
			</pre>
		</div>
	);
}
