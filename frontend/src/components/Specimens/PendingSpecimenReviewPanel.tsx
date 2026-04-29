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
import { PendingSpecimenSubmissionBadge } from "./PendingSpecimenSubmissionBadge";
import type { SpecimenStatus } from "./SpecimenStatusFilter";

export const rejectSecondaryClassName =
	"border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/70";

interface PendingCardActionsProps {
	status: SpecimenStatus;
	canReview: boolean;
	canReject: boolean;
	canDeletePending: boolean;
	isBusy: boolean;
	commentByAuthor?: string | null;
	commentByReviewer?: string | null;
	onStartReviewAction: (actionType: "approve" | "reject") => Promise<void>;
	onRequestDelete: () => void;
}

function PendingCardActions({
	status,
	canReview,
	canReject,
	canDeletePending,
	isBusy,
	commentByAuthor,
	commentByReviewer,
	onStartReviewAction,
	onRequestDelete,
}: PendingCardActionsProps) {
	if (status !== "pending") {
		if (commentByAuthor?.trim().length || commentByReviewer?.trim().length) {
			return (
				<>
					{commentByAuthor?.trim().length ? (
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
					) : null}
					{commentByReviewer?.trim().length ? (
						<>
							<span>Comment by Reviewer</span>
							<Textarea
								value={commentByReviewer}
								readOnly
								disabled
								rows={2}
								className="w-full text-sm"
							/>
						</>
					) : null}
				</>
			);
		}
		return null;
	}

	if (!canReview && canDeletePending) {
		return (
			<>
				{commentByAuthor?.trim().length ? (
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
				) : null}
				<Button
					type="button"
					variant="destructive"
					className="w-full min-w-28"
					disabled={isBusy}
					onClick={onRequestDelete}
				>
					Delete
				</Button>
			</>
		);
	}

	return (
		<>
			{commentByAuthor?.trim().length ? (
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
			) : null}
			<div className="flex w-full gap-2">
				{canReject ? (
					<Button
						variant="secondary"
						type="button"
						className={`flex-1 ${rejectSecondaryClassName}`}
						disabled={isBusy}
						onClick={() => void onStartReviewAction("reject")}
					>
						Reject
					</Button>
				) : canDeletePending ? (
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
	canDeletePending: boolean;
	canReject: boolean;
	canReview: boolean;
	commentByAuthor?: string | null;
	commentByReviewer?: string | null;
	createdAt: string;
	detailsLinks: ReactNode;
	isBusy: boolean;
	isNew: boolean;
	onRequestDelete: () => void;
	onStartReviewAction: (actionType: "approve" | "reject") => Promise<void>;
	requestedByContent: ReactNode;
	staleReviewWarning?: string | null;
	status: SpecimenStatus;
	submissionPanelDescription: string;
	submissionPanelTitle: string;
}

export function PendingSpecimenReviewPanel({
	canDeletePending,
	canReject,
	canReview,
	commentByAuthor,
	commentByReviewer,
	createdAt,
	detailsLinks,
	isBusy,
	isNew,
	onRequestDelete,
	onStartReviewAction,
	requestedByContent,
	staleReviewWarning,
	status,
	submissionPanelDescription,
	submissionPanelTitle,
}: PendingSpecimenReviewPanelProps) {
	return (
		<div className="grid gap-4 pr-4">
			<Card>
				<CardHeader>
					<div className="flex items-start justify-between gap-3">
						<div className="space-y-1">
							<CardTitle className="text-base">
								{submissionPanelTitle}
							</CardTitle>
							<CardDescription>{submissionPanelDescription}</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="grid gap-3">
					{staleReviewWarning ? (
						<div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
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
					<div className="text-sm text-muted-foreground">
						Requested by {requestedByContent}
					</div>
					{status === "pending" ? (
						<PendingCardActions
							status={status}
							canReview={canReview}
							canReject={canReject}
							canDeletePending={canDeletePending}
							isBusy={isBusy}
							commentByAuthor={commentByAuthor}
							commentByReviewer={commentByReviewer}
							onStartReviewAction={onStartReviewAction}
							onRequestDelete={onRequestDelete}
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
