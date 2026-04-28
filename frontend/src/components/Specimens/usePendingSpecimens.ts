import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useFailuremodeGetModes } from "@/api/endpoints/failuremode/failuremode";
import { useFastenertypeGetFastenerTypes } from "@/api/endpoints/fastenertype/fastenertype";
import { useJoinerytypeGetJtypes } from "@/api/endpoints/joinerytype/joinerytype";
import { useLoadingdirectionGetLoadingDirections } from "@/api/endpoints/loadingdirection/loadingdirection";
import {
	usePendingSpecimensApprovePendingSpecimen,
	usePendingSpecimensDeletePendingSpecimen,
	usePendingSpecimensListPendingSpecimens,
	usePendingSpecimensRejectPendingSpecimenRoute,
} from "@/api/endpoints/pending-specimens/pending-specimens";
import { useSpecimensReadSpecimens } from "@/api/endpoints/specimens/specimens";
import { useSubjoinerytypeGetSjtypes } from "@/api/endpoints/subjoinerytype/subjoinerytype";
import { useUsersReadUsers } from "@/api/endpoints/users/users";
import type { HTTPValidationError } from "@/api/model";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { handleError } from "@/lib/utils";
import type { SpecimenStatus } from "./SpecimenStatusFilter";

export function usePendingSpecimens(status: SpecimenStatus) {
	const [comment, setComment] = useState("");
	const queryClient = useQueryClient();
	const { data: currentUser } = useCurrentUser();

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
	const { data: specimenListData } = useSpecimensReadSpecimens(
		{ skip: 0, limit: 500 },
		{ query: { queryKey: ["pendingSpecimenLookup", "specimens"] } },
	);
	const { data: usersData } = useUsersReadUsers(
		{ skip: 0, limit: 500 },
		{
			query: {
				queryKey: ["pendingSpecimenLookup", "users"],
				enabled: Boolean(currentUser?.is_superuser),
			},
		},
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
			onError: (err: undefined | HTTPValidationError) => {
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
			onError: (err: undefined | HTTPValidationError) => {
				handleError(err);
			},
		},
	});

	const deleteMutation = usePendingSpecimensDeletePendingSpecimen({
		mutation: {
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: ["pendingSpecimens", status],
				});
				toast.success("Pending specimen deleted", {
					description: "The pending specimen has been removed.",
					position: "bottom-right",
				});
			},
			onError: (err: undefined | HTTPValidationError) => {
				handleError(err);
			},
		},
	});

	async function onApprove(id: string): Promise<void> {
		try {
			await approveMutation.mutateAsync({
				pendingId: id,
				data: { comment_by_reviewer: comment } as never,
			});
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
			await rejectMutation.mutateAsync({
				pendingId: id,
				data: { comment_by_reviewer: comment } as never,
			});
			setComment("");
		} catch (err) {
			toast.error("Rejection failed", {
				description: err instanceof Error ? err.message : "Unknown error",
				position: "bottom-right",
			});
		}
	}

	async function onDelete(id: string): Promise<void> {
		try {
			await deleteMutation.mutateAsync({
				pendingId: id,
			});
			setComment("");
		} catch (err) {
			toast.error("Delete failed", {
				description: err instanceof Error ? err.message : "Unknown error",
				position: "bottom-right",
			});
		}
	}

	return {
		actions: {
			onApprove,
			onDelete,
			onReject,
		},
		currentUser,
		data,
		isLoading:
			isLoading ||
			isLoadingJoinery ||
			isLoadingFastener ||
			isLoadingDirection ||
			isLoadingSubjoinery ||
			isLoadingQFM,
		lookups: {
			fastenerData,
			joineryData,
			loadingDirectionData,
			QFMData,
			specimenListData,
			subjoineryData,
			usersData,
		},
		reviewState: {
			approvePendingId: approveMutation.variables?.pendingId,
			comment,
			deletePendingId: deleteMutation.variables?.pendingId,
			rejectPendingId: rejectMutation.variables?.pendingId,
			setComment,
		},
	};
}
