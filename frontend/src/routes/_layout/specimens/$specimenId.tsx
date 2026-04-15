import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod/v4";
import { useDoiGetDoiById } from "@/api/endpoints/doi/doi";
import { useSpecimensReadSpecimen } from "@/api/endpoints/specimens/specimens";
import SkeletonSpecimen from "@/components/Skeleton/SkeletonSpecimen";
import { Specimen } from "@/components/Specimens/Specimen";
import { SpecimenEditForm } from "@/components/Specimens/SpecimenEditForm";
import { SpecimenHeader } from "@/components/Specimens/SpecimenHeader";
import { SpecimenReferenceSheet } from "@/components/Specimens/SpecimenReferenceSheet";
import { useIsLoggedIn } from "@/hooks/useIsLoggedIn";

export const Route = createFileRoute("/_layout/specimens/$specimenId")({
	validateSearch: z.object({
		edit: z.boolean().optional(),
	}),
	staticData: {
		title: "Specimen Details",
	},
	component: SpecimenDetails,
});

function getEditRedirectUrl() {
	if (typeof window === "undefined") {
		return "/specimens";
	}

	const url = new URL(window.location.href);
	url.searchParams.set("edit", "true");
	return url.toString();
}

function SpecimenDetails() {
	const { specimenId } = Route.useParams();
	const { edit } = Route.useSearch();
	const navigate = useNavigate();
	const isLoggedIn = useIsLoggedIn();
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

	const handleStartEditing = () => {
		if (!isLoggedIn) {
			navigate({
				to: "/login",
				search: {
					redirect: getEditRedirectUrl(),
				},
			});
			return;
		}

		navigate({
			to: Route.fullPath,
			params: { specimenId },
			search: { edit: true },
		});
	};

	return (
		<div className="flex flex-col gap-6">
			{edit ? (
				<>
					<SpecimenHeader
						id={data.specimen_reference_id ?? data.id}
						onEditClick={handleStartEditing}
					/>
					<SpecimenEditForm
						specimen={data}
						onCancel={() =>
							navigate({
								to: Route.fullPath,
								params: { specimenId },
								search: {},
							})
						}
						onSubmitted={() =>
							navigate({
								to: Route.fullPath,
								params: { specimenId },
								search: {},
							})
						}
					/>
				</>
			) : (
				<>
					<Specimen data={data} setSheetOpen={setSheetOpen} onEditClick={handleStartEditing} />
					<SpecimenReferenceSheet
						specimen={data}
						mode="doi"
						relatedSpecimens={relatedSpecimens}
						open={sheetOpen}
						onOpenChange={setSheetOpen}
					/>
				</>
			)}
		</div>
	);
}
