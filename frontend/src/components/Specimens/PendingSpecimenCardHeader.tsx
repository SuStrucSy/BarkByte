import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
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
					<PendingSpecimenMeta
						createdAt={createdAt}
						isNew={isNew}
						requester={requester}
						status={status}
						className="gap-1 pt-2"
						dateButtonClassName="h-auto font-semibold text-base"
						badgeClassName={
							isNew
								? "shrink-0 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
								: "shrink-0 bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
						}
					/>
				</div>
				<div className="justify-self-start sm:justify-self-end">
					<div className="flex flex-col items-start gap-2 sm:items-end">
						{status === "pending" ? (
							<PendingSpecimenReviewActions
								isBusy={isBusy}
								layout="inline"
								onStartReviewAction={onStartReviewAction}
								onRequestDelete={onRequestDelete}
								permissions={permissions}
							/>
						) : null}
					</div>
				</div>
			</div>
		</CardHeader>
	);
}
