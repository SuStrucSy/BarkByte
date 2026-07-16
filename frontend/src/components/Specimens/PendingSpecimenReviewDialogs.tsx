import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
	PendingSpecimenAuthorComment,
	PendingSpecimenMeta,
} from "./PendingSpecimenReviewShared";
import {
	getPendingSpecimenStatusCopy,
	type ReviewAction,
} from "./pendingSpecimenReviewTypes";
import type { SpecimenStatus } from "./SpecimenStatusFilter";

interface PendingSpecimenReviewDialogProps {
	comment: string;
	commentByAuthor?: string | null;
	createdAt: string;
	dialogAction: ReviewAction | null;
	isNew: boolean;
	onApprove: () => void;
	onConfirmClose: () => void;
	onOpenChange: (open: boolean) => void;
	onReject: () => void;
	setComment: (value: string) => void;
	status: SpecimenStatus;
}

export function PendingSpecimenReviewDialog({
	comment,
	commentByAuthor,
	createdAt,
	dialogAction,
	isNew,
	onApprove,
	onConfirmClose,
	onOpenChange,
	onReject,
	setComment,
	status,
}: PendingSpecimenReviewDialogProps) {
	const { submissionDescription, submissionTitle } =
		getPendingSpecimenStatusCopy(status);
	const dialogTitle =
		dialogAction === "approve"
			? "Approve pending specimen?"
			: "Reject pending specimen?";
	const dialogPlaceholder =
		dialogAction === "approve"
			? "Optional comment for approval..."
			: "Optional comment for rejection...";

	return (
		<AlertDialog open={dialogAction !== null} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{submissionTitle}</AlertDialogTitle>
					<AlertDialogDescription>
						{submissionDescription}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<div className="grid gap-4">
					<PendingSpecimenMeta
						createdAt={createdAt}
						isNew={isNew}
						status={status}
					/>
					<PendingSpecimenAuthorComment commentByAuthor={commentByAuthor} />
					<div className="grid gap-2">
						<span>{dialogTitle}</span>
						<Textarea
							placeholder={dialogPlaceholder}
							value={comment}
							onChange={(event) => setComment(event.target.value)}
							rows={2}
							className="w-full text-sm"
						/>
					</div>
				</div>
				<AlertDialogFooter>
					<AlertDialogCancel
						onClick={() => {
							onOpenChange(false);
							setComment("");
						}}
					>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={() => {
							if (dialogAction === "approve") {
								onApprove();
							} else if (dialogAction === "reject") {
								onReject();
							}
							onConfirmClose();
						}}
					>
						{dialogAction === "approve"
							? "Confirm Approval"
							: "Confirm Rejection"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

interface PendingSpecimenDeleteDialogProps {
	onConfirm: () => void;
	onOpenChange: (open: boolean) => void;
	open: boolean;
}

export function PendingSpecimenDeleteDialog({
	onConfirm,
	onOpenChange,
	open,
}: PendingSpecimenDeleteDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete pending specimen?</AlertDialogTitle>
					<AlertDialogDescription>
						This will permanently remove this pending specimen submission.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={onConfirm}>
						Confirm Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
