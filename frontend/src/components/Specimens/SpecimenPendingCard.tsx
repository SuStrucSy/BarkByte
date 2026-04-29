import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { pendingSpecimensListPendingSpecimens } from "@/api/endpoints/pending-specimens/pending-specimens";
import { useSpecimensReadSpecimen } from "@/api/endpoints/specimens/specimens";
import type {
	PendingSpecimenPublicChangedData,
	SpecimenPublic,
} from "@/api/model";
import type { SpecimenStatus } from "@/components/Specimens/SpecimenStatusFilter";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PendingSpecimenDetailsDrawer } from "./PendingSpecimenDetailsDrawer";
import { PendingSpecimenDetailsLinks } from "./PendingSpecimenDetailsLinks";
import {
	PendingSpecimenChangedOnly,
	PendingSpecimenDiffTabs,
} from "./PendingSpecimenDiffTabs";
import {
	PendingSpecimenDeleteDialog,
	PendingSpecimenReviewDialog,
} from "./PendingSpecimenReviewDialogs";
import {
	PendingSpecimenReviewPanel,
	rejectSecondaryClassName,
} from "./PendingSpecimenReviewPanel";
import { PendingSpecimenSubmissionBadge } from "./PendingSpecimenSubmissionBadge";

interface SpecimenPendingCardProps {
	specimen: Partial<SpecimenPublic>;
	changedData: PendingSpecimenPublicChangedData;
	specimenId: string | null;
	pendingID: string;
	createdAt: string;
	requestedBy: string;
	requestedByEmail?: string | null;
	isBusy: boolean;
	comment: string;
	commentByAuthor?: string | null;
	commentByReviewer?: string | null;
	setComment: React.Dispatch<React.SetStateAction<string>>;
	onApprove: (id: string) => Promise<void>;
	onReject: (id: string) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
	isNew: boolean;
	status: SpecimenStatus;
	canReview: boolean;
	canReject: boolean;
	canDeletePending: boolean;
}

export function SpecimenPendingCard({
	specimen,
	changedData,
	specimenId,
	pendingID,
	createdAt,
	requestedBy,
	requestedByEmail,
	isBusy,
	comment,
	commentByAuthor,
	commentByReviewer,
	setComment,
	onApprove,
	onReject,
	onDelete,
	isNew,
	status,
	canReview,
	canReject,
	canDeletePending,
}: SpecimenPendingCardProps) {
	const [detailsOpen, setDetailsOpen] = useState(false);
	const [dialogAction, setDialogAction] = useState<"approve" | "reject" | null>(
		null,
	);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [staleReviewWarning, setStaleReviewWarning] = useState<string | null>(
		null,
	);

	const queryClient = useQueryClient();
	const { data: originalSpecimen } = useSpecimensReadSpecimen(
		specimenId ?? "",
		{
			query: {
				enabled: !isNew && !!specimenId,
			},
		},
	);

	const requestedByContent = requestedByEmail ? (
		<a
			href={`mailto:${requestedByEmail}`}
			className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary"
		>
			{requestedBy}
		</a>
	) : (
		<span className="font-medium text-foreground">{requestedBy}</span>
	);

	const cardTitleFallback =
		status === "approved"
			? "Approved specimen"
			: status === "rejected"
				? "Rejected specimen"
				: "Pending specimen";

	const cardDescription =
		status === "approved"
			? "Review this approved specimen submission and compare the applied changes."
			: status === "rejected"
				? "Review this rejected specimen submission and compare the proposed changes."
				: "Review this specimen submission and compare pending changes.";

	const submissionPanelTitle =
		status === "approved"
			? "Approved Submission"
			: status === "rejected"
				? "Rejected Submission"
				: "Pending Submission";

	const submissionPanelDescription =
		status === "approved"
			? "Approval metadata and reviewer actions."
			: status === "rejected"
				? "Rejection metadata and reviewer actions."
				: "Submission metadata and reviewer actions.";

	const resetReviewUi = () => {
		setDialogAction(null);
		setDeleteDialogOpen(false);
		setComment("");
		setStaleReviewWarning(null);
	};

	const openDialogReviewAction = async (actionType: "approve" | "reject") => {
		await checkForLatestPendingChanges(() => {
			setComment("");
			setDialogAction(actionType);
		});
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

	const requestDelete = () => {
		setDeleteDialogOpen(true);
	};

	const detailsTabs = (
		<PendingSpecimenDiffTabs
			changedData={changedData}
			isNew={isNew}
			originalSpecimen={originalSpecimen}
			specimen={specimen}
		/>
	);

	const detailsLinks = (
		<PendingSpecimenDetailsLinks
			originalSpecimen={originalSpecimen}
			specimen={specimen}
			specimenId={specimenId}
		/>
	);

	const reviewPanel = (
		<PendingSpecimenReviewPanel
			canDeletePending={canDeletePending}
			canReject={canReject}
			canReview={canReview}
			commentByAuthor={commentByAuthor}
			commentByReviewer={commentByReviewer}
			createdAt={createdAt}
			detailsLinks={detailsLinks}
			isBusy={isBusy}
			isNew={isNew}
			onRequestDelete={requestDelete}
			onStartReviewAction={openDialogReviewAction}
			requestedByContent={requestedByContent}
			staleReviewWarning={staleReviewWarning}
			status={status}
			submissionPanelDescription={submissionPanelDescription}
			submissionPanelTitle={submissionPanelTitle}
		/>
	);

	return (
		<Card className="w-full max-w-3xl">
			<CardHeader className="gap-3">
				<div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
					<div className="min-w-0 space-y-1">
						<CardTitle>
							{specimen.specimen_reference_id ?? cardTitleFallback}
						</CardTitle>
						<CardDescription>{cardDescription}</CardDescription>
						<div className="flex flex-wrap items-center gap-2 pt-2">
							<Button
								variant="link"
								className="h-auto px-0 text-base font-semibold"
							>
								{createdAt}
							</Button>
							<PendingSpecimenSubmissionBadge
								isNew={isNew}
								status={status}
								className={
									isNew
										? "shrink-0 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
										: "shrink-0 bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
								}
							/>
						</div>
						<div className="text-sm text-muted-foreground">
							Requested by {requestedByContent}
						</div>
					</div>
					<div className="justify-self-start sm:justify-self-end">
						<div className="flex flex-col items-start gap-2 sm:items-end">
							{status === "pending" && canReview ? (
								<div className="flex items-center gap-2">
									{canReject ? (
										<Button
											variant="secondary"
											type="button"
											size="sm"
											className={`w-auto min-w-28 ${rejectSecondaryClassName}`}
											disabled={isBusy}
											onClick={() =>
												void checkForLatestPendingChanges(() => {
													setComment("");
													setDialogAction("reject");
												})
											}
										>
											Reject
										</Button>
									) : canDeletePending ? (
										<Button
											type="button"
											variant="destructive"
											size="sm"
											className="w-auto min-w-28"
											disabled={isBusy}
											onClick={requestDelete}
										>
											Delete
										</Button>
									) : null}
									<Button
										type="button"
										size="sm"
										className="w-auto min-w-28"
										disabled={isBusy}
										onClick={() => void openDialogReviewAction("approve")}
									>
										Approve
									</Button>
								</div>
							) : status === "pending" && canDeletePending ? (
								<Button
									type="button"
									variant="destructive"
									size="sm"
									className="w-auto min-w-28"
									disabled={isBusy}
									onClick={requestDelete}
								>
									Delete
								</Button>
							) : null}
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent className="grid gap-4">
				<Card>
					<CardHeader>
						<div className="flex items-start justify-between gap-3">
							<div>
								<CardTitle className="text-base">Changed Attributes</CardTitle>
								<CardDescription>
									A compact review of the submitted changes.
								</CardDescription>
							</div>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setDetailsOpen(true)}
							>
								More Details
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<ScrollArea className="h-72 pr-3">
							<div className="grid gap-3">
								<PendingSpecimenChangedOnly
									changedData={changedData}
									isNew={isNew}
									originalSpecimen={originalSpecimen}
									specimen={specimen}
								/>
							</div>
						</ScrollArea>
					</CardContent>
				</Card>
				{status === "rejected" && commentByReviewer?.trim().length ? (
					<div className="px-1 text-sm">
						<span className="font-medium">Comment by Reviewer:</span>{" "}
						<span className="text-muted-foreground italic">
							"{commentByReviewer}"
						</span>
					</div>
				) : null}
			</CardContent>
			<PendingSpecimenDetailsDrawer
				open={detailsOpen}
				onOpenChange={(open) => {
					setDetailsOpen(open);
					if (!open) {
						resetReviewUi();
					}
				}}
				detailsTabs={detailsTabs}
				reviewPanel={reviewPanel}
				title={specimen.specimen_reference_id ?? cardTitleFallback}
			/>
			<PendingSpecimenReviewDialog
				comment={comment}
				commentByAuthor={commentByAuthor}
				createdAt={createdAt}
				dialogAction={dialogAction}
				isNew={isNew}
				onApprove={() => void onApprove(pendingID)}
				onConfirmClose={() => setDialogAction(null)}
				onReject={() => void onReject(pendingID)}
				onOpenChange={(open) => {
					if (!open) {
						setDialogAction(null);
						setComment("");
					}
				}}
				setComment={setComment}
				status={status}
				submissionPanelDescription={submissionPanelDescription}
				submissionPanelTitle={submissionPanelTitle}
			/>
			<PendingSpecimenDeleteDialog
				open={deleteDialogOpen}
				onOpenChange={(open) => {
					setDeleteDialogOpen(open);
				}}
				onConfirm={() => {
					void onDelete(pendingID);
					setDeleteDialogOpen(false);
				}}
			/>
		</Card>
	);
}
