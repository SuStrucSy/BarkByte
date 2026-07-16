import type { PendingSpecimenRequester } from "./pendingSpecimenReviewTypes";

type PendingSpecimenRequesterNameProps = {
	requester: PendingSpecimenRequester;
};

export function PendingSpecimenRequesterName({
	requester,
}: PendingSpecimenRequesterNameProps) {
	if (requester.email) {
		return (
			<a
				href={`mailto:${requester.email}`}
				className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary"
			>
				{requester.name}
			</a>
		);
	}

	return <span className="font-medium text-foreground">{requester.name}</span>;
}
