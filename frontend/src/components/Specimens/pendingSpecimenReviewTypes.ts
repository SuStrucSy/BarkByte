import type { SpecimenStatus } from "./SpecimenStatusFilter";

export type ReviewAction = "approve" | "reject";

export type PendingSpecimenReviewPermissions = {
	canDeletePending: boolean;
	canReject: boolean;
	canReview: boolean;
};

export type PendingSpecimenRequester = {
	email?: string | null;
	name: string;
};

export const rejectSecondaryClassName =
	"border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/70";

export function getPendingSpecimenStatusCopy(status: SpecimenStatus) {
	if (status === "approved") {
		return {
			cardDescription:
				"Review this approved specimen submission and compare the applied changes.",
			cardTitleFallback: "Approved specimen",
			submissionDescription: "Approval metadata and reviewer actions.",
			submissionTitle: "Approved Submission",
		};
	}

	if (status === "rejected") {
		return {
			cardDescription:
				"Review this rejected specimen submission and compare the proposed changes.",
			cardTitleFallback: "Rejected specimen",
			submissionDescription: "Rejection metadata and reviewer actions.",
			submissionTitle: "Rejected Submission",
		};
	}

	return {
		cardDescription:
			"Review this specimen submission and compare pending changes.",
		cardTitleFallback: "Pending specimen",
		submissionDescription: "Submission metadata and reviewer actions.",
		submissionTitle: "Pending Submission",
	};
}
