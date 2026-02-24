import { useFailuremodeGetModes } from "@/api/endpoints/failuremode/failuremode.gen";
import { useFastenertypeGetFastenerTypes } from "@/api/endpoints/fastenertype/fastenertype.gen";
import { useJoinerytypeGetJtypes } from "@/api/endpoints/joinerytype/joinerytype.gen";
import { useLoadingdirectionGetLoadingDirections } from "@/api/endpoints/loadingdirection/loadingdirection.gen";
import {
  usePendingSpecimensApprovePendingSpecimen,
  usePendingSpecimensListPendingSpecimens,
  usePendingSpecimensRejectPendingSpecimenRoute,
} from "@/api/endpoints/pending-specimens/pending-specimens.gen";
import { useSubjoinerytypeGetSjtypes } from "@/api/endpoints/subjoinerytype/subjoinerytype.gen";
import type {
  HTTPValidationError,
  PendingSpecimenPublicChangedData,
  SpecimenPublic,
} from "@/api/model";
import { SkeletonCard } from "@/components/Skeleton/SkeletonCard";
import {
  SpecimenPendingCard,
  type ActiveAction,
} from "@/components/Specimens/SpecimenPendingCard";
import {
  StatusFilter,
  type SpecimenStatus,
} from "@/components/Specimens/SpecimenStatusFilter";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { handleError } from "@/utils";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Layers, RefreshCcwIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_layout/specimens/pending")({
  staticData: {
    title: "Pending Specimens",
  },
  component: PendingSpecimens,
});

function PendingSpecimensGrid({ status }: { status: SpecimenStatus }) {
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = usePendingSpecimensListPendingSpecimens(
    { status },
    { query: { queryKey: ["pendingSpecimens", status] } },
  );
  const { data: joineryData, isLoading: isLoadingJoinery } =
    useJoinerytypeGetJtypes({}, { query: { queryKey: ["joineryTypes"] } });
  const { data: fastenerData, isLoading: isLoadingFastener } =
    useFastenertypeGetFastenerTypes({}, { query: { queryKey: ["fasteners"] } });
  const { data: loadingDirectionData, isLoading: isLoadingDirection } =
    useLoadingdirectionGetLoadingDirections(
      {},
      { query: { queryKey: ["loadingDirections"] } },
    );
  const { data: subjoineryData, isLoading: isLoadingSubjoinery } =
    useSubjoinerytypeGetSjtypes(
      {},
      { query: { queryKey: ["subjoineryTypes"] } },
    );
  const { data: QFMData, isLoading: isLoadingQFM } = useFailuremodeGetModes(
    { dowel: true, connector: true },
    { query: { queryKey: ["QFMTypes"] } },
  );

  const approveMutation = usePendingSpecimensApprovePendingSpecimen({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["pendingSpecimens", status],
        });
        toast.success("Specimen approved!", {
          description: "The specimen has been approved.",
          position: "bottom-right",
        });
      },
      onError: (err: void | HTTPValidationError) => {
        handleError(err);
      },
    },
  });

  const rejectMutation = usePendingSpecimensRejectPendingSpecimenRoute({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["pendingSpecimens", status],
        });
        toast.success("Specimen rejected!", {
          description: "The specimen has been rejected.",
          position: "bottom-right",
        });
      },
      onError: (err: void | HTTPValidationError) => {
        handleError(err);
      },
    },
  });

  async function onApprove(id: string): Promise<void> {
    try {
      await approveMutation.mutateAsync({ pendingId: id, data: { comment } });
      setActiveAction(null);
      setComment("");
    } catch (err) {
      toast.error("Approval failed", {
        description: err instanceof Error ? err.message : "Unknown error",
        position: "bottom-right",
      });
    }
  }

  async function onReject(id: string): Promise<void> {
    try {
      await rejectMutation.mutateAsync({ pendingId: id, data: { comment } });
      setActiveAction(null);
      setComment("");
    } catch (err) {
      toast.error("Rejection failed", {
        description: err instanceof Error ? err.message : "Unknown error",
        position: "bottom-right",
      });
    }
  }

  if (
    isLoading ||
    isLoadingJoinery ||
    isLoadingFastener ||
    isLoadingDirection ||
    isLoadingSubjoinery ||
    isLoadingQFM
  ) {
    return (
      <div className="grid gap-4 grid-cols-2">
        {Array.from({ length: 10 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (!data?.pending_specimens.length) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Layers />
          </EmptyMedia>
          <EmptyTitle>No Specimens Found</EmptyTitle>
          <EmptyDescription className="max-w-xs text-pretty">
            There are no {status} specimens.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            variant="outline"
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ["pendingSpecimens", status],
              })
            }
          >
            <RefreshCcwIcon />
            Refresh
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-2">
      {data.pending_specimens.map((specimen) => {
        const changed: PendingSpecimenPublicChangedData = specimen.changed_data;

        const matchingJoints = joineryData?.data.filter(
          (joint) => changed["joinery_type_id"] === joint.id,
        );
        const matchingFasteners = fastenerData?.data.filter((fastener) =>
          changed["fastener_type_ids"].includes(fastener.id),
        );
        const matchingLoadingDirection = loadingDirectionData?.data.filter(
          (loadingDir) =>
            changed["loading_direction_ids"].includes(loadingDir.id),
        );
        const matchingSubJoints = subjoineryData?.data.filter(
          (joint) => changed["sub_joinery_type_id"] === joint.id,
        );
        const matchingQFM = QFMData?.data.filter((qfm) =>
          changed["e_qualitative_failure_measure"].includes(qfm.id),
        );

        const spec: SpecimenPublic = {
          assembly_type: changed["assembly_type"],
          connection_description: changed["connection_description"],
          connector: changed["connector"],
          connector_mechanical_properties: changed["connection_description"],
          doi: changed["doi_id"],
          dowel: changed["dowel"],
          e_date: changed["e_date"],
          e_ductility: changed["e_ductility"],
          e_max_displacement: changed["e_max_displacement"],
          e_max_force: changed["e_max_force"],
          e_measurement_unit: changed["e_measurement_unit"],
          e_qfm_description: changed["e_qfm_description"],
          e_qualitative_failure_measure: matchingQFM,
          e_stiffness: changed["e_stiffness"],
          e_test_loading_type: changed["e_test_loading_type"],
          e_ultimate_displacement: changed["e_ultimate_displacement"],
          e_ultimate_force: changed["e_ultimate_force"],
          e_yield_displacement: changed["e_yield_displacement"],
          e_yield_force: changed["e_yield_force"],
          e_yield_point_method: changed["e_yield_point_method"],
          element_dimension: changed["element_dimension"],
          fastener_mechanical_properties:
            changed["fastener_mechanical_properties"],
          fastener_numbers: changed["fastener_numbers"],
          fastener_types: matchingFasteners,
          id: specimen.specimen_id,
          joinery_type: matchingJoints,
          loading_directions: matchingLoadingDirection,
          moisture_percentage: changed["moisture_percentage"],
          note: changed["note"],
          practice: changed["practice"],
          replicate_tests: changed["replicate_tests"],
          specimen_reference_id: changed["specimen_reference_id"],
          sub_joinery_type: matchingSubJoints,
          uploader_id: specimen.changed_by_user_id,
          wood_mechanical_properties: changed["wood_mechanical_properties"],
          wood_type: changed["wood_type"],
        };

        const isApprovingThis =
          approveMutation.isPending &&
          approveMutation.variables?.pendingId === specimen.id;
        const isRejectingThis =
          rejectMutation.isPending &&
          rejectMutation.variables?.pendingId === specimen.id;

        return (
          <SpecimenPendingCard
            key={specimen.id}
            createdAt={new Date(specimen.created_at).toDateString()}
            specimen={spec}
            isBusy={isApprovingThis || isRejectingThis}
            pendingID={specimen.id}
            commentByReviewer={specimen.comment_by_reviewer}
            comment={comment}
            activeAction={activeAction}
            setActiveAction={setActiveAction}
            setComment={setComment}
            onApprove={onApprove}
            onReject={onReject}
            isNew={specimen.specimen_id === null}
            status={status}
          />
        );
      })}
    </div>
  );
}

function PendingSpecimens() {
  const [status, setStatus] = useState<SpecimenStatus>("pending");
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Specimens</h1>
          <p className="text-sm text-muted-foreground">
            Review and manage submitted specimens
          </p>
        </div>
        <StatusFilter value={status} onChange={setStatus} />
      </div>
      <PendingSpecimensGrid status={status} />
    </div>
  );
}
