import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useDoiGetDoiById } from "@/api/endpoints/doi/doi";
import { useSpecimensReadSpecimen } from "@/api/endpoints/specimens/specimens";
import SkeletonSpecimen from "@/components/Skeleton/SkeletonSpecimen";
import { Specimen } from "@/components/Specimens/Specimen";
import { SpecimenReferenceSheet } from "@/components/Specimens/SpecimenReferenceSheet";

export const Route = createFileRoute("/_layout/specimens/$specimenId")({
	staticData: {
		title: "Specimen Details",
	},
	component: SpecimenDetails,
});

function SpecimenDetails() {
	const { specimenId } = Route.useParams();
	const [sheetOpen, setSheetOpen] = useState(false);
	const { data, isLoading, isError, error } =
		useSpecimensReadSpecimen(specimenId);

	const doiId = data?.doi?.id ?? "";

	const { data: doiData, isLoading: doiLoading } = useDoiGetDoiById(doiId, {
		query: {
			enabled: !!doiId,
		},
	});

	if (isLoading || doiLoading) {
		return <SkeletonSpecimen />;
	}

	if (isError) {
		return (
			<div>Failed to load specimen: {error?.message ?? "Unknown error"}</div>
		);
	}

	if (!data) {
		return <div>Specimen not found.</div>;
	}

	const relatedSpecimens = (doiData?.specimens?.data ?? []).filter(
		(specimen) => (specimenId ? specimen.id !== specimenId : true),
	);

	return (
		<div className="flex flex-col gap-6">
			<Specimen data={data} setSheetOpen={setSheetOpen} />
			<SpecimenReferenceSheet
				specimen={data}
				mode="doi"
				relatedSpecimens={relatedSpecimens}
				open={sheetOpen}
				onOpenChange={setSheetOpen}
			/>
		</div>
	);
}
