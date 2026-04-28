import type { ComponentProps, Dispatch, SetStateAction } from "react";
import type {
	FailureModes,
	FastenerTypes,
	JoineryTypes,
	LoadingDirections,
	PendingSpecimenPublic,
	SpecimenPublic,
	SubJoineryTypes,
	UserPublic,
} from "@/api/model";
import type {
	PendingSpecimenStackPreviewData,
	PendingSpecimenStackPreviewEntry,
} from "@/components/Specimens/PendingSpecimenStack";
import type { SpecimenPendingCard } from "@/components/Specimens/SpecimenPendingCard";
import type { SpecimenStatus } from "@/components/Specimens/SpecimenStatusFilter";
import { buildPendingSpecimenDisplayData } from "@/components/Specimens/specimenDiff";
import {
	getDisplayText,
	getSpecimenDisplayLabel,
	renderValue,
} from "@/lib/utils";

type PendingSpecimenCardProps = ComponentProps<typeof SpecimenPendingCard>;

export type PendingSpecimenCardModel = PendingSpecimenStackPreviewEntry & {
	stackId: string;
	createdAtMs: number;
	cardProps: PendingSpecimenCardProps;
};

interface BuildPendingSpecimenCardsArgs {
	actions: {
		onApprove: (id: string) => Promise<void>;
		onDelete: (id: string) => Promise<void>;
		onReject: (id: string) => Promise<void>;
	};
	currentUser?: UserPublic;
	lookups: {
		fastenerData?: FastenerTypes;
		joineryData?: JoineryTypes;
		loadingDirectionData?: LoadingDirections;
		QFMData?: FailureModes;
		specimenListData?: { data: SpecimenPublic[] };
		subjoineryData?: SubJoineryTypes;
		usersData?: { data: UserPublic[] };
	};
	pendingSpecimens: PendingSpecimenPublic[];
	reviewState: {
		approvePendingId?: string;
		comment: string;
		deletePendingId?: string;
		rejectPendingId?: string;
		setComment: Dispatch<SetStateAction<string>>;
	};
	status: SpecimenStatus;
}

export function buildPendingSpecimenCards({
	actions,
	currentUser,
	lookups,
	pendingSpecimens,
	reviewState,
	status,
}: BuildPendingSpecimenCardsArgs): PendingSpecimenCardModel[] {
	const {
		fastenerData,
		joineryData,
		loadingDirectionData,
		QFMData,
		specimenListData,
		subjoineryData,
		usersData,
	} = lookups;
	const {
		approvePendingId,
		comment,
		deletePendingId,
		rejectPendingId,
		setComment,
	} = reviewState;
	const specimenLookup = new Map(
		(specimenListData?.data ?? []).map((specimen) => [specimen.id, specimen]),
	);
	const userLookup = new Map(
		[...(usersData?.data ?? []), ...(currentUser ? [currentUser] : [])].map(
			(user) => [user.id, user],
		),
	);

	return pendingSpecimens.map((pendingSpecimen) => {
		const changed = pendingSpecimen.changed_data;
		const spec: Partial<SpecimenPublic> = buildPendingSpecimenDisplayData(
			changed,
			{
				joineryTypes: joineryData?.data,
				fastenerTypes: fastenerData?.data,
				loadingDirections: loadingDirectionData?.data,
				subjoineryTypes: subjoineryData?.data,
				failureModes: QFMData?.data,
			},
		);

		const createdAt = new Date(pendingSpecimen.created_at);
		const stackId = pendingSpecimen.specimen_id ?? `new-${pendingSpecimen.id}`;
		const existingSpecimen = pendingSpecimen.specimen_id
			? specimenLookup.get(pendingSpecimen.specimen_id)
			: undefined;
		const requester = userLookup.get(pendingSpecimen.changed_by_user_id);
		const requestedBy =
			requester?.full_name?.trim() || requester?.email || "Unknown user";
		const requestedByEmail = requester?.email ?? null;
		const isOwnPendingSpecimen =
			currentUser?.id === pendingSpecimen.changed_by_user_id;
		const canReview = Boolean(currentUser?.is_superuser);
		const canReject = canReview && !isOwnPendingSpecimen;
		const canDeletePending =
			status === "pending" &&
			Boolean(
				currentUser && (!currentUser.is_superuser || isOwnPendingSpecimen),
			);
		const stackTitleCandidate = getDisplayText(
			spec.specimen_reference_id,
			"Unnamed",
		);
		const stackTitle =
			stackTitleCandidate !== "—"
				? stackTitleCandidate
				: getSpecimenDisplayLabel(existingSpecimen) !== "Unnamed"
					? getSpecimenDisplayLabel(existingSpecimen)
					: pendingSpecimen.specimen_id
						? "Unnamed specimen"
						: "New specimen submission";
		const stackSubtitle = [
			pendingSpecimen.specimen_id
				? "Pending updates for this specimen"
				: "New specimen request",
			existingSpecimen?.doi?.ref_title ?? null,
			renderValue(spec.assembly_type),
			renderValue(spec.joinery_type?.label),
			renderValue(spec.sub_joinery_type?.label),
		]
			.filter((value) => value && value !== "—")
			.join(" • ");

		return {
			id: pendingSpecimen.id,
			stackId,
			specimenId: pendingSpecimen.specimen_id ?? null,
			stackTitle,
			stackSubtitle,
			createdAtLabel: createdAt.toDateString(),
			createdAtMs: createdAt.getTime(),
			cardProps: {
				createdAt: createdAt.toDateString(),
				specimen: spec,
				changedData: changed,
				specimenId: pendingSpecimen.specimen_id ?? null,
				requestedBy,
				requestedByEmail,
				isBusy:
					approvePendingId === pendingSpecimen.id ||
					rejectPendingId === pendingSpecimen.id ||
					deletePendingId === pendingSpecimen.id,
				pendingID: pendingSpecimen.id,
				commentByAuthor: pendingSpecimen.comment_by_author,
				commentByReviewer: pendingSpecimen.comment_by_reviewer,
				comment,
				setComment,
				onApprove: actions.onApprove,
				onReject: actions.onReject,
				onDelete: actions.onDelete,
				isNew: pendingSpecimen.specimen_id === null,
				status,
				canReview,
				canReject,
				canDeletePending,
			},
		};
	});
}

export function groupPendingSpecimenCards(cards: PendingSpecimenCardModel[]) {
	return Object.values(
		cards.reduce<Record<string, PendingSpecimenCardModel[]>>((acc, card) => {
			acc[card.stackId] ??= [];
			acc[card.stackId].push(card);
			return acc;
		}, {}),
	)
		.map((group) => [...group].sort((a, b) => b.createdAtMs - a.createdAtMs))
		.sort((a, b) => b[0].createdAtMs - a[0].createdAtMs);
}

export function getPendingSpecimenStackPreview(
	stack: PendingSpecimenCardModel[],
): PendingSpecimenStackPreviewData {
	return {
		lead: stack[0],
		submissions: stack,
	};
}
