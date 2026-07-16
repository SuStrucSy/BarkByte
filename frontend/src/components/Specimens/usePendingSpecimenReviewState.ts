import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { pendingSpecimensListPendingSpecimens } from "@/api/endpoints/pending-specimens/pending-specimens";
import type { PendingSpecimenPublicChangedData } from "@/api/model";
import type { ReviewAction } from "./pendingSpecimenReviewTypes";
import type { SpecimenStatus } from "./SpecimenStatusFilter";

type UsePendingSpecimenReviewStateParams = {
	changedData: PendingSpecimenPublicChangedData;
	commentByAuthor?: string | null;
	pendingID: string;
	setComment: React.Dispatch<React.SetStateAction<string>>;
	status: SpecimenStatus;
};

export function usePendingSpecimenReviewState({
	changedData,
	commentByAuthor,
	pendingID,
	setComment,
	status,
}: UsePendingSpecimenReviewStateParams) {
	const [detailsOpen, setDetailsOpen] = useState(false);
	const [dialogAction, setDialogAction] = useState<ReviewAction | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [staleReviewWarning, setStaleReviewWarning] = useState<string | null>(
		null,
	);
	const queryClient = useQueryClient();

	const resetReviewUi = () => {
		setDialogAction(null);
		setDeleteDialogOpen(false);
		setComment("");
		setStaleReviewWarning(null);
	};

	const checkForLatestPendingChanges = async (
		onCurrentSnapshot: () => void,
	) => {
		const latestList = await pendingSpecimensListPendingSpecimens({ status });
		const latestPending = latestList.pending_specimens.find(
			(pending) => pending.id === pendingID,
		);

		if (!latestPending || latestPending.status !== "pending") {
			queryClient.setQueryData(["pendingSpecimens", status], latestList);
			resetReviewUi();
			toast.error("This submission changed", {
				description:
					"It is no longer pending. The page has been refreshed to the latest state.",
				position: "bottom-right",
			});
			return;
		}

		const hasChangedSinceLoad =
			JSON.stringify(latestPending.changed_data ?? {}) !==
				JSON.stringify(changedData ?? {}) ||
			(latestPending.comment_by_author ?? "") !== (commentByAuthor ?? "");

		if (hasChangedSinceLoad) {
			queryClient.setQueryData(["pendingSpecimens", status], latestList);
			setComment("");
			setDialogAction(null);
			setStaleReviewWarning(
				"This submission changed since you loaded the page. Review the latest changes before continuing.",
			);
			setDetailsOpen(true);
			return;
		}

		setStaleReviewWarning(null);
		onCurrentSnapshot();
	};

	const openDialogReviewAction = async (actionType: ReviewAction) => {
		await checkForLatestPendingChanges(() => {
			setComment("");
			setDialogAction(actionType);
		});
	};

	const requestDelete = () => {
		setDeleteDialogOpen(true);
	};

	return {
		deleteDialogOpen,
		detailsOpen,
		dialogAction,
		openDialogReviewAction,
		requestDelete,
		resetReviewUi,
		setDeleteDialogOpen,
		setDetailsOpen,
		setDialogAction,
		staleReviewWarning,
	};
}
