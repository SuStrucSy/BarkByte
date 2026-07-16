import { useSpecimensReadSpecimen } from "@/api/endpoints/specimens/specimens";
import type {
	PendingSpecimenPublicChangedData,
	SpecimenPublic,
} from "@/api/model";
import type { SpecimenStatus } from "@/components/Specimens/SpecimenStatusFilter";
import { Card, CardContent } from "@/components/ui/card";
import { PendingSpecimenCardHeader } from "./PendingSpecimenCardHeader";
import { PendingSpecimenChangedAttributesCard } from "./PendingSpecimenChangedAttributesCard";
import { PendingSpecimenDetailsDrawer } from "./PendingSpecimenDetailsDrawer";
import { PendingSpecimenDetailsLinks } from "./PendingSpecimenDetailsLinks";
import { PendingSpecimenDiffTabs } from "./PendingSpecimenDiffTabs";
import {
	PendingSpecimenDeleteDialog,
	PendingSpecimenReviewDialog,
} from "./PendingSpecimenReviewDialogs";
import { PendingSpecimenReviewPanel } from "./PendingSpecimenReviewPanel";
import {
	getPendingSpecimenStatusCopy,
	type PendingSpecimenRequester,
	type PendingSpecimenReviewPermissions,
} from "./pendingSpecimenReviewTypes";
import { usePendingSpecimenReviewState } from "./usePendingSpecimenReviewState";

interface SpecimenPendingCardProps {
	specimen: Partial<SpecimenPublic>;
	changedData: PendingSpecimenPublicChangedData;
	specimenId: string | null;
	pendingID: string;
	createdAt: string;
	requester: PendingSpecimenRequester;
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
	permissions: PendingSpecimenReviewPermissions;
}

export function SpecimenPendingCard({
	specimen,
	changedData,
	specimenId,
	pendingID,
	createdAt,
	requester,
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
	permissions,
}: SpecimenPendingCardProps) {
	const { data: originalSpecimen } = useSpecimensReadSpecimen(
		specimenId ?? "",
		{
			query: {
				enabled: !isNew && !!specimenId,
			},
		},
	);
	const {
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
	} = usePendingSpecimenReviewState({
		changedData,
		commentByAuthor,
		pendingID,
		setComment,
		status,
	});

	const { cardTitleFallback } = getPendingSpecimenStatusCopy(status);
	const cardTitle = specimen.specimen_reference_id ?? cardTitleFallback;

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
			commentByAuthor={commentByAuthor}
			createdAt={createdAt}
			detailsLinks={detailsLinks}
			isBusy={isBusy}
			isNew={isNew}
			onRequestDelete={requestDelete}
			onStartReviewAction={openDialogReviewAction}
			permissions={permissions}
			requester={requester}
			staleReviewWarning={staleReviewWarning}
			status={status}
		/>
	);

	const handleDetailsOpenChange = (open: boolean) => {
		setDetailsOpen(open);
		if (!open) {
			resetReviewUi();
		}
	};

	const handleReviewDialogOpenChange = (open: boolean) => {
		if (!open) {
			setDialogAction(null);
			setComment("");
		}
	};

	const handleDeleteConfirm = () => {
		void onDelete(pendingID);
		setDeleteDialogOpen(false);
	};

	return (
		<Card className="w-full max-w-3xl">
			<PendingSpecimenCardHeader
				createdAt={createdAt}
				isBusy={isBusy}
				isNew={isNew}
				onRequestDelete={requestDelete}
				onStartReviewAction={openDialogReviewAction}
				permissions={permissions}
				requester={requester}
				status={status}
				title={cardTitle}
			/>
			<CardContent className="grid gap-4">
				<PendingSpecimenChangedAttributesCard
					changedData={changedData}
					isNew={isNew}
					onOpenDetails={() => setDetailsOpen(true)}
					originalSpecimen={originalSpecimen}
					specimen={specimen}
				/>
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
				onOpenChange={handleDetailsOpenChange}
				detailsTabs={detailsTabs}
				reviewPanel={reviewPanel}
				title={cardTitle}
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
				onOpenChange={handleReviewDialogOpenChange}
				setComment={setComment}
				status={status}
			/>
			<PendingSpecimenDeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				onConfirm={handleDeleteConfirm}
			/>
		</Card>
	);
}
