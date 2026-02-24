import { createFileRoute } from "@tanstack/react-router";
import { useSpecimensReadSpecimen } from "@/api/endpoints/specimens/specimens.gen";
import { DOISheet } from "@/components/Specimens/DOISheet";
import { useDoiGetDoiById } from "@/api/endpoints/doi/doi.gen";
import SkeletonSpecimen from "@/components/Skeleton/SkeletonSpecimen";
import { useState } from "react";
import { Specimen } from "@/components/Specimens/Specimen";

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
      <DOISheet
        doi={data.doi}
        relatedSpecimens={relatedSpecimens}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
