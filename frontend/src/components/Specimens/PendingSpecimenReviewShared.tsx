import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { PendingSpecimenRequesterName } from "./PendingSpecimenRequester";
import { PendingSpecimenSubmissionBadge } from "./PendingSpecimenSubmissionBadge";
import {
	type PendingSpecimenRequester,
	type PendingSpecimenReviewPermissions,
	type ReviewAction,
	rejectSecondaryClassName,
} from "./pendingSpecimenReviewTypes";
import type { SpecimenStatus } from "./SpecimenStatusFilter";

interface PendingSpecimenMetaProps {
	badgeClassName?: string;
	className?: string;
	createdAt: string;
	dateButtonClassName?: string;
	isNew: boolean;
	requester?: PendingSpecimenRequester;
	status: SpecimenStatus;
}

export function PendingSpecimenMeta({
	badgeClassName,
	className,
	createdAt,
	dateButtonClassName,
	isNew,
	requester,
	status,
}: PendingSpecimenMetaProps) {
	return (
		<div className={cn("grid gap-2", className)}>
			<div className="flex flex-wrap items-center gap-2">
				<Button variant="link" className={cn("px-0", dateButtonClassName)}>
					{createdAt}
				</Button>
				<PendingSpecimenSubmissionBadge
					isNew={isNew}
					status={status}
					className={badgeClassName}
				/>
			</div>
			{requester ? (
				<div className="text-muted-foreground text-sm">
					Requested by <PendingSpecimenRequesterName requester={requester} />
				</div>
			) : null}
		</div>
	);
}

interface PendingSpecimenAuthorCommentProps {
	className?: string;
	commentByAuthor?: string | null;
}

export function PendingSpecimenAuthorComment({
	className,
	commentByAuthor,
}: PendingSpecimenAuthorCommentProps) {
	if (!commentByAuthor?.trim().length) {
		return null;
	}

	return (
		<div className={cn("grid gap-2", className)}>
			<span>Comment by Author</span>
			<Textarea
				value={commentByAuthor}
				readOnly
				disabled
				rows={3}
				className="w-full text-sm"
			/>
		</div>
	);
}

interface PendingSpecimenReviewActionsProps {
	isBusy: boolean;
	layout?: "full" | "inline";
	onRequestDelete: () => void;
	onStartReviewAction: (actionType: ReviewAction) => Promise<void>;
	permissions: PendingSpecimenReviewPermissions;
}

export function PendingSpecimenReviewActions({
	isBusy,
	layout = "full",
	onRequestDelete,
	onStartReviewAction,
	permissions,
}: PendingSpecimenReviewActionsProps) {
	const isInline = layout === "inline";
	const buttonSize = isInline ? "sm" : "default";
	const rejectButtonClassName = cn(
		isInline ? "w-auto min-w-28" : "flex-1",
		rejectSecondaryClassName,
	);
	const deleteButtonClassName = isInline
		? "w-auto min-w-28"
		: "min-w-28 flex-1";
	const approveButtonClassName = isInline ? "w-auto min-w-28" : "flex-1";

	if (!permissions.canReview) {
		return permissions.canDeletePending ? (
			<Button
				type="button"
				variant="destructive"
				size={buttonSize}
				className={isInline ? "w-auto min-w-28" : "w-full min-w-28"}
				disabled={isBusy}
				onClick={onRequestDelete}
			>
				Delete
			</Button>
		) : null;
	}

	return (
		<div className={isInline ? "flex items-center gap-2" : "flex w-full gap-2"}>
			{permissions.canReject ? (
				<Button
					variant="secondary"
					type="button"
					size={buttonSize}
					className={rejectButtonClassName}
					disabled={isBusy}
					onClick={() => void onStartReviewAction("reject")}
				>
					Reject
				</Button>
			) : permissions.canDeletePending ? (
				<Button
					type="button"
					variant="destructive"
					size={buttonSize}
					className={deleteButtonClassName}
					disabled={isBusy}
					onClick={onRequestDelete}
				>
					Delete
				</Button>
			) : null}
			<Button
				type="button"
				size={buttonSize}
				className={approveButtonClassName}
				disabled={isBusy}
				onClick={() => void onStartReviewAction("approve")}
			>
				Approve
			</Button>
		</div>
	);
}
