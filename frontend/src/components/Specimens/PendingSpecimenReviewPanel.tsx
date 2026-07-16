import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	PendingSpecimenAuthorComment,
	PendingSpecimenMeta,
	PendingSpecimenReviewActions,
} from "./PendingSpecimenReviewShared";
import {
	getPendingSpecimenStatusCopy,
	type PendingSpecimenRequester,
	type PendingSpecimenReviewPermissions,
	type ReviewAction,
} from "./pendingSpecimenReviewTypes";
import type { SpecimenStatus } from "./SpecimenStatusFilter";

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
					<PendingSpecimenMeta
						createdAt={createdAt}
						isNew={isNew}
						requester={requester}
						status={status}
					/>
					{status === "pending" ? (
						<>
							<PendingSpecimenAuthorComment commentByAuthor={commentByAuthor} />
							<PendingSpecimenReviewActions
								isBusy={isBusy}
								onStartReviewAction={onStartReviewAction}
								onRequestDelete={onRequestDelete}
								permissions={permissions}
							/>
						</>
					) : (
						<PendingSpecimenAuthorComment commentByAuthor={commentByAuthor} />
					)}
				</CardContent>
			</Card>
			{detailsLinks}
		</div>
	);
}
