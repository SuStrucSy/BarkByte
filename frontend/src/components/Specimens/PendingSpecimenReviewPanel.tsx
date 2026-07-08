import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PendingSpecimenRequesterName } from "./PendingSpecimenRequester";
import { PendingSpecimenSubmissionBadge } from "./PendingSpecimenSubmissionBadge";
import {
	getPendingSpecimenStatusCopy,
	type PendingSpecimenRequester,
	type PendingSpecimenReviewPermissions,
	type ReviewAction,
	rejectSecondaryClassName,
} from "./pendingSpecimenReviewTypes";
import type { SpecimenStatus } from "./SpecimenStatusFilter";

interface PendingCardActionsProps {
	isBusy: boolean;
	commentByAuthor?: string | null;
	onStartReviewAction: (actionType: ReviewAction) => Promise<void>;
	onRequestDelete: () => void;
	permissions: PendingSpecimenReviewPermissions;
}

function PendingCardActions({
	isBusy,
	commentByAuthor,
	onStartReviewAction,
	onRequestDelete,
	permissions,
}: PendingCardActionsProps) {
	const authorComment = commentByAuthor?.trim().length ? (
		<>
			<span>Comment by Author</span>
			<Textarea
				value={commentByAuthor}
				readOnly
				disabled
				rows={3}
				className="w-full text-sm"
			/>
		</>
	) : null;

	if (!permissions.canReview) {
		return (
			<>
				{authorComment}
				{permissions.canDeletePending ? (
					<Button
						type="button"
						variant="destructive"
						className="w-full min-w-28"
						disabled={isBusy}
						onClick={onRequestDelete}
					>
						Delete
					</Button>
				) : null}
			</>
		);
	}

	return (
		<>
			{authorComment}
			<div className="flex w-full gap-2">
				{permissions.canReject ? (
					<Button
						variant="secondary"
						type="button"
						className={`flex-1 ${rejectSecondaryClassName}`}
						disabled={isBusy}
						onClick={() => void onStartReviewAction("reject")}
					>
						Reject
					</Button>
				) : permissions.canDeletePending ? (
					<Button
						type="button"
						variant="destructive"
						className="min-w-28 flex-1"
						disabled={isBusy}
						onClick={onRequestDelete}
					>
						Delete
					</Button>
				) : null}
				<Button
					type="button"
					className="flex-1"
					disabled={isBusy}
					onClick={() => void onStartReviewAction("approve")}
				>
					Approve
				</Button>
			</div>
		</>
	);
}

interface PendingSpecimenReviewPanelProps {
	commentByAuthor?: string | null;
	createdAt: string;
	detailsLinks: ReactNode;
	isBusy: boolean;
	isNew: boolean;
	onRequestDelete: () => void;
	onStartReviewAction: (actionType: ReviewAction) => Promise<void>;
	permissions: PendingSpecimenReviewPermissions;
	requester: PendingSpecimenRequester;
	staleReviewWarning?: string | null;
	status: SpecimenStatus;
}

export function PendingSpecimenReviewPanel({
	commentByAuthor,
	createdAt,
	detailsLinks,
	isBusy,
	isNew,
	onRequestDelete,
	onStartReviewAction,
	permissions,
	requester,
	staleReviewWarning,
	status,
}: PendingSpecimenReviewPanelProps) {
	const { submissionDescription, submissionTitle } =
		getPendingSpecimenStatusCopy(status);

	return (
		<div className="grid gap-4 pr-4">
			<Card>
				<CardHeader>
					<div className="flex items-start justify-between gap-3">
						<div className="space-y-1">
							<CardTitle className="text-base">{submissionTitle}</CardTitle>
							<CardDescription>{submissionDescription}</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="grid gap-3">
					{staleReviewWarning ? (
						<div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-900 text-sm dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
							<TriangleAlert className="mt-0.5 size-4 shrink-0" />
							<span>{staleReviewWarning}</span>
						</div>
					) : null}
					<div className="flex flex-wrap items-center gap-2">
						<Button variant="link" className="px-0">
							{createdAt}
						</Button>
						<PendingSpecimenSubmissionBadge isNew={isNew} status={status} />
					</div>
					<div className="text-muted-foreground text-sm">
						Requested by <PendingSpecimenRequesterName requester={requester} />
					</div>
					{status === "pending" ? (
						<PendingCardActions
							isBusy={isBusy}
							commentByAuthor={commentByAuthor}
							onStartReviewAction={onStartReviewAction}
							onRequestDelete={onRequestDelete}
							permissions={permissions}
						/>
					) : commentByAuthor?.trim().length ? (
						<div className="grid gap-2">
							<span>Comment by Author</span>
							<Textarea
								value={commentByAuthor}
								readOnly
								disabled
								rows={3}
								className="w-full text-sm"
							/>
						</div>
					) : null}
				</CardContent>
			</Card>
			{detailsLinks}
		</div>
	);
}
