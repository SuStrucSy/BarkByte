import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

type PendingSpecimenCardHeaderProps = {
	createdAt: string;
	isBusy: boolean;
	isNew: boolean;
	onRequestDelete: () => void;
	onStartReviewAction: (actionType: ReviewAction) => Promise<void>;
	permissions: PendingSpecimenReviewPermissions;
	requester: PendingSpecimenRequester;
	status: SpecimenStatus;
	title: string;
};

export function PendingSpecimenCardHeader({
	createdAt,
	isBusy,
	isNew,
	onRequestDelete,
	onStartReviewAction,
	permissions,
	requester,
	status,
	title,
}: PendingSpecimenCardHeaderProps) {
	const { cardDescription } = getPendingSpecimenStatusCopy(status);

	return (
		<CardHeader className="gap-3">
			<div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
				<div className="min-w-0 space-y-1">
					<CardTitle>{title}</CardTitle>
					<CardDescription>{cardDescription}</CardDescription>
					<div className="flex flex-wrap items-center gap-2 pt-2">
						<Button
							variant="link"
							className="h-auto px-0 font-semibold text-base"
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
					<div className="text-muted-foreground text-sm">
						Requested by <PendingSpecimenRequesterName requester={requester} />
					</div>
				</div>
				<div className="justify-self-start sm:justify-self-end">
					<div className="flex flex-col items-start gap-2 sm:items-end">
						{status === "pending" && permissions.canReview ? (
							<div className="flex items-center gap-2">
								{permissions.canReject ? (
									<Button
										variant="secondary"
										type="button"
										size="sm"
										className={`w-auto min-w-28 ${rejectSecondaryClassName}`}
										disabled={isBusy}
										onClick={() => void onStartReviewAction("reject")}
									>
										Reject
									</Button>
								) : permissions.canDeletePending ? (
									<Button
										type="button"
										variant="destructive"
										size="sm"
										className="w-auto min-w-28"
										disabled={isBusy}
										onClick={onRequestDelete}
									>
										Delete
									</Button>
								) : null}
								<Button
									type="button"
									size="sm"
									className="w-auto min-w-28"
									disabled={isBusy}
									onClick={() => void onStartReviewAction("approve")}
								>
									Approve
								</Button>
							</div>
						) : status === "pending" && permissions.canDeletePending ? (
							<Button
								type="button"
								variant="destructive"
								size="sm"
								className="w-auto min-w-28"
								disabled={isBusy}
								onClick={onRequestDelete}
							>
								Delete
							</Button>
						) : null}
					</div>
				</div>
			</div>
		</CardHeader>
	);
}
