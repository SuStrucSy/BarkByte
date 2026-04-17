import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowUpRight,
	ChevronDown,
	ChevronRight,
	Layers,
	RefreshCcwIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useFailuremodeGetModes } from "@/api/endpoints/failuremode/failuremode";
import { useFastenertypeGetFastenerTypes } from "@/api/endpoints/fastenertype/fastenertype";
import { useJoinerytypeGetJtypes } from "@/api/endpoints/joinerytype/joinerytype";
import { useLoadingdirectionGetLoadingDirections } from "@/api/endpoints/loadingdirection/loadingdirection";
import {
	usePendingSpecimensApprovePendingSpecimen,
	usePendingSpecimensDeletePendingSpecimen,
	usePendingSpecimensListPendingSpecimens,
	usePendingSpecimensRejectPendingSpecimenRoute,
} from "@/api/endpoints/pending-specimens/pending-specimens";
import {
	useSpecimensReadSpecimen,
	useSpecimensReadSpecimens,
} from "@/api/endpoints/specimens/specimens";
import { useSubjoinerytypeGetSjtypes } from "@/api/endpoints/subjoinerytype/subjoinerytype";
import { useUsersReadUsers } from "@/api/endpoints/users/users";
import type {
	HTTPValidationError,
	PendingSpecimenPublicChangedData,
	SpecimenPublic,
} from "@/api/model";
import { SkeletonCard } from "@/components/Skeleton/SkeletonCard";
import {
	type ActiveAction,
	SpecimenPendingCard,
} from "@/components/Specimens/SpecimenPendingCard";
import {
	type SpecimenStatus,
	StatusFilter,
} from "@/components/Specimens/SpecimenStatusFilter";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn, handleError, renderValue } from "@/lib/utils";

export const Route = createFileRoute(
	"/_layout/_authenticated/specimens/pending",
)({
	staticData: {
		title: "Pending",
	},
	component: PendingSpecimens,
});

function PendingSpecimensGrid({ status }: { status: SpecimenStatus }) {
	const [activeAction, setActiveAction] = useState<ActiveAction>(null);
	const [comment, setComment] = useState("");
	const [openStacks, setOpenStacks] = useState<string[]>([]);
	const queryClient = useQueryClient();
	const { data: currentUser } = useCurrentUser();

	const { data, isLoading } = usePendingSpecimensListPendingSpecimens(
		{ status },
		{ query: { queryKey: ["pendingSpecimens", status] } },
	);
	const { data: joineryData, isLoading: isLoadingJoinery } =
		useJoinerytypeGetJtypes({}, { query: { queryKey: ["joineryTypes"] } });
	const { data: fastenerData, isLoading: isLoadingFastener } =
		useFastenertypeGetFastenerTypes({}, { query: { queryKey: ["fasteners"] } });
	const { data: loadingDirectionData, isLoading: isLoadingDirection } =
		useLoadingdirectionGetLoadingDirections(
			{},
			{ query: { queryKey: ["loadingDirections"] } },
		);
	const { data: subjoineryData, isLoading: isLoadingSubjoinery } =
		useSubjoinerytypeGetSjtypes(
			{},
			{ query: { queryKey: ["subjoineryTypes"] } },
		);
	const { data: QFMData, isLoading: isLoadingQFM } = useFailuremodeGetModes(
		{ dowel: true, connector: true },
		{ query: { queryKey: ["QFMTypes"] } },
	);
	const { data: specimenListData } = useSpecimensReadSpecimens(
		{ skip: 0, limit: 500 },
		{ query: { queryKey: ["pendingSpecimenLookup", "specimens"] } },
	);
	const { data: usersData } = useUsersReadUsers(
		{ skip: 0, limit: 500 },
		{
			query: {
				queryKey: ["pendingSpecimenLookup", "users"],
				enabled: Boolean(currentUser?.is_superuser),
			},
		},
	);

	const approveMutation = usePendingSpecimensApprovePendingSpecimen({
		mutation: {
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: ["pendingSpecimens", status],
				});
				toast.success("Specimen approved!", {
					description: "The specimen has been approved.",
					position: "bottom-right",
				});
			},
			onError: (err: undefined | HTTPValidationError) => {
				handleError(err);
			},
		},
	});

	const rejectMutation = usePendingSpecimensRejectPendingSpecimenRoute({
		mutation: {
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: ["pendingSpecimens", status],
				});
				toast.success("Specimen rejected!", {
					description: "The specimen has been rejected.",
					position: "bottom-right",
				});
			},
			onError: (err: undefined | HTTPValidationError) => {
				handleError(err);
			},
		},
	});
	const deleteMutation = usePendingSpecimensDeletePendingSpecimen({
		mutation: {
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: ["pendingSpecimens", status],
				});
				toast.success("Pending specimen deleted", {
					description: "The pending specimen has been removed.",
					position: "bottom-right",
				});
			},
			onError: (err: undefined | HTTPValidationError) => {
				handleError(err);
			},
		},
	});

	async function onApprove(id: string): Promise<void> {
		try {
			await approveMutation.mutateAsync({
				pendingId: id,
				data: { comment_by_reviewer: comment } as never,
			});
			setActiveAction(null);
			setComment("");
		} catch (err) {
			toast.error("Approval failed", {
				description: err instanceof Error ? err.message : "Unknown error",
				position: "bottom-right",
			});
		}
	}

	async function onReject(id: string): Promise<void> {
		try {
			await rejectMutation.mutateAsync({
				pendingId: id,
				data: { comment_by_reviewer: comment } as never,
			});
			setActiveAction(null);
			setComment("");
		} catch (err) {
			toast.error("Rejection failed", {
				description: err instanceof Error ? err.message : "Unknown error",
				position: "bottom-right",
			});
		}
	}

	async function onDelete(id: string): Promise<void> {
		try {
			await deleteMutation.mutateAsync({
				pendingId: id,
			});
			setActiveAction(null);
			setComment("");
		} catch (err) {
			toast.error("Delete failed", {
				description: err instanceof Error ? err.message : "Unknown error",
				position: "bottom-right",
			});
		}
	}

	if (
		isLoading ||
		isLoadingJoinery ||
		isLoadingFastener ||
		isLoadingDirection ||
		isLoadingSubjoinery ||
		isLoadingQFM
	) {
		return (
			<div className="grid gap-4 grid-cols-2">
				{Array.from({ length: 10 }).map((_, index) => (
					<SkeletonCard key={index} />
				))}
			</div>
		);
	}

	if (!data?.pending_specimens.length) {
		return (
			<Empty className="border border-dashed">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Layers />
					</EmptyMedia>
					<EmptyTitle>No Specimens Found</EmptyTitle>
					<EmptyDescription className="max-w-xs text-pretty">
						There are no {status} specimens.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<div className="flex max-w-xs items-center gap-2 text-sm text-muted-foreground">
						<ArrowUpRight className="size-4 shrink-0" />
						<span>Use the "Refresh" button in the top right.</span>
					</div>
				</EmptyContent>
			</Empty>
		);
	}

	type PendingCardData = {
		id: string;
		stackId: string;
		specimenId: string | null;
		stackTitle: string;
		stackSubtitle: string;
		createdAtLabel: string;
		createdAtMs: number;
		card: React.ReactNode;
	};

	const specimenLookup = new Map(
		(specimenListData?.data ?? []).map((specimen) => [specimen.id, specimen]),
	);
	const userLookup = new Map(
		[...(usersData?.data ?? []), ...(currentUser ? [currentUser] : [])].map(
			(user) => [user.id, user],
		),
	);

	const pendingCards: PendingCardData[] = data.pending_specimens.map(
		(specimen) => {
			const changed: PendingSpecimenPublicChangedData = specimen.changed_data;
			const changedFastenerIds = Array.isArray(changed.fastener_type_ids)
				? (changed.fastener_type_ids as string[])
				: [];
			const changedLoadingDirectionIds = Array.isArray(
				changed.loading_direction_ids,
			)
				? (changed.loading_direction_ids as string[])
				: [];
			const changedQfmIds = Array.isArray(changed.e_qualitative_failure_measure)
				? (changed.e_qualitative_failure_measure as string[])
				: [];

			const matchingJoints = joineryData?.data.filter(
				(joint) => changed.joinery_type_id === joint.id,
			);
			const matchingFasteners = fastenerData?.data.filter((fastener) =>
				changedFastenerIds.includes(fastener.id ?? ""),
			);
			const matchingLoadingDirection = loadingDirectionData?.data.filter(
				(loadingDir) =>
					changedLoadingDirectionIds.includes(loadingDir.id ?? ""),
			);
			const matchingSubJoints = subjoineryData?.data.filter(
				(joint) => changed.sub_joinery_type_id === joint.id,
			);
			const matchingQFM = QFMData?.data.filter((qfm) =>
				changedQfmIds.includes(qfm.id ?? ""),
			);

			const spec: Partial<SpecimenPublic> = {
				assembly_type: changed.assembly_type as SpecimenPublic["assembly_type"],
				connection_description: changed.connection_description as
					| SpecimenPublic["connection_description"]
					| undefined,
				connector: changed.connector as SpecimenPublic["connector"],
				connector_mechanical_properties:
					changed.connector_mechanical_properties as SpecimenPublic["connector_mechanical_properties"],
				dowel: changed.dowel as SpecimenPublic["dowel"],
				e_date: changed.e_date as SpecimenPublic["e_date"],
				e_ductility: changed.e_ductility as SpecimenPublic["e_ductility"],
				e_max_displacement:
					changed.e_max_displacement as SpecimenPublic["e_max_displacement"],
				e_max_force: changed.e_max_force as SpecimenPublic["e_max_force"],
				e_qfm_description:
					changed.e_qfm_description as SpecimenPublic["e_qfm_description"],
				e_qualitative_failure_measure: matchingQFM ?? [],
				e_stiffness: changed.e_stiffness as SpecimenPublic["e_stiffness"],
				e_test_loading_type:
					changed.e_test_loading_type as SpecimenPublic["e_test_loading_type"],
				e_ultimate_displacement:
					changed.e_ultimate_displacement as SpecimenPublic["e_ultimate_displacement"],
				e_ultimate_force:
					changed.e_ultimate_force as SpecimenPublic["e_ultimate_force"],
				e_yield_displacement:
					changed.e_yield_displacement as SpecimenPublic["e_yield_displacement"],
				e_yield_force: changed.e_yield_force as SpecimenPublic["e_yield_force"],
				e_yield_point_method:
					changed.e_yield_point_method as SpecimenPublic["e_yield_point_method"],
				element_dimension:
					changed.element_dimension as SpecimenPublic["element_dimension"],
				fastener_mechanical_properties:
					changed.fastener_mechanical_properties as SpecimenPublic["fastener_mechanical_properties"],
				fastener_numbers:
					changed.fastener_numbers as SpecimenPublic["fastener_numbers"],
				fastener_types: matchingFasteners ?? [],
				joinery_type: matchingJoints?.[0],
				loading_directions: matchingLoadingDirection ?? [],
				moisture_percentage:
					changed.moisture_percentage as SpecimenPublic["moisture_percentage"],
				note: changed.note as SpecimenPublic["note"],
				practice: changed.practice as SpecimenPublic["practice"],
				replicate_tests:
					changed.replicate_tests as SpecimenPublic["replicate_tests"],
				specimen_reference_id:
					changed.specimen_reference_id as SpecimenPublic["specimen_reference_id"],
				sub_joinery_type: matchingSubJoints?.[0],
				wood_mechanical_properties:
					changed.wood_mechanical_properties as SpecimenPublic["wood_mechanical_properties"],
				wood_type: changed.wood_type as SpecimenPublic["wood_type"],
			};

			const isApprovingThis =
				approveMutation.isPending &&
				approveMutation.variables?.pendingId === specimen.id;
			const isRejectingThis =
				rejectMutation.isPending &&
				rejectMutation.variables?.pendingId === specimen.id;
			const isDeletingThis =
				deleteMutation.isPending &&
				deleteMutation.variables?.pendingId === specimen.id;

			const createdAt = new Date(specimen.created_at);
			const stackId = specimen.specimen_id ?? `new-${specimen.id}`;
			const existingSpecimen = specimen.specimen_id
				? specimenLookup.get(specimen.specimen_id)
				: undefined;
			const requester = userLookup.get(specimen.changed_by_user_id);
			const requestedBy =
				requester?.full_name?.trim() ||
				requester?.email ||
				specimen.changed_by_user_id;
			const isOwnPendingSpecimen =
				currentUser?.id === specimen.changed_by_user_id;
			const canReview = Boolean(currentUser?.is_superuser);
			const canReject = canReview && !isOwnPendingSpecimen;
			const canDeletePending =
				status === "pending" &&
				Boolean(
					currentUser && (!currentUser.is_superuser || isOwnPendingSpecimen),
				);
			const stackTitle =
				spec.specimen_reference_id ??
				existingSpecimen?.specimen_reference_id ??
				(specimen.specimen_id
					? specimen.specimen_id
					: "New specimen submission");
			const stackSubtitle = [
				specimen.specimen_id
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
				id: specimen.id,
				stackId,
				specimenId: specimen.specimen_id ?? null,
				stackTitle,
				stackSubtitle,
				createdAtLabel: createdAt.toDateString(),
				createdAtMs: createdAt.getTime(),
				card: (
					<SpecimenPendingCard
						key={specimen.id}
						createdAt={createdAt.toDateString()}
						specimen={spec}
						changedData={changed}
						specimenId={specimen.specimen_id ?? null}
						requestedBy={requestedBy}
						isBusy={isApprovingThis || isRejectingThis || isDeletingThis}
						pendingID={specimen.id}
						commentByAuthor={specimen.comment_by_author}
						commentByReviewer={specimen.comment_by_reviewer}
						comment={comment}
						activeAction={activeAction}
						setActiveAction={setActiveAction}
						setComment={setComment}
						onApprove={onApprove}
						onReject={onReject}
						onDelete={onDelete}
						isNew={specimen.specimen_id === null}
						status={status}
						canReview={canReview}
						canReject={canReject}
						canDeletePending={canDeletePending}
					/>
				),
			};
		},
	);

	const groupedStacks = Object.values(
		pendingCards.reduce<Record<string, PendingCardData[]>>(
			(acc, pendingCard) => {
				acc[pendingCard.stackId] ??= [];
				acc[pendingCard.stackId].push(pendingCard);
				return acc;
			},
			{},
		),
	)
		.map((group) => [...group].sort((a, b) => b.createdAtMs - a.createdAtMs))
		.sort((a, b) => b[0].createdAtMs - a[0].createdAtMs);

	const toggleStack = (stackId: string) => {
		setOpenStacks((current) =>
			current.includes(stackId)
				? current.filter((id) => id !== stackId)
				: [...current, stackId],
		);
	};

	return (
		<div className="grid gap-6 xl:grid-cols-2">
			{groupedStacks.map((stack) => {
				const lead = stack[0];
				const isOpen = openStacks.includes(lead.stackId);
				const hasMultiple = stack.length > 1;

				if (!hasMultiple) {
					return (
						<div key={lead.stackId} className="min-w-0">
							{lead.card}
						</div>
					);
				}

				return (
					<div key={lead.stackId} className="min-w-0">
						<PendingSpecimenStackPreview
							lead={lead}
							stack={stack}
							isOpen={isOpen}
							onToggle={() => toggleStack(lead.stackId)}
						/>
						<div
							className={cn(
								"overflow-hidden transition-[max-height,opacity,margin] duration-500 ease-out",
								isOpen
									? "mt-4 max-h-[240rem] opacity-100"
									: "mt-0 max-h-0 opacity-0",
							)}
						>
							<div className="grid gap-4">
								{stack.map((entry, index) => (
									<div
										key={entry.id}
										className={cn(
											"min-w-0 transition-[opacity,transform] duration-500 ease-out",
											isOpen
												? "translate-y-0 scale-100 opacity-100"
												: "-translate-y-8 scale-[0.985] opacity-0",
										)}
										style={{
											transitionDelay: isOpen ? `${index * 85}ms` : "0ms",
										}}
									>
										{entry.card}
									</div>
								))}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}

function PendingSpecimenStackPreview({
	lead,
	stack,
	isOpen,
	onToggle,
}: {
	lead: {
		id: string;
		specimenId: string | null;
		stackTitle: string;
		stackSubtitle: string;
		createdAtLabel: string;
	};
	stack: Array<{
		id: string;
		createdAtLabel: string;
	}>;
	isOpen: boolean;
	onToggle: () => void;
}) {
	const { data: exactSpecimen } = useSpecimensReadSpecimen(
		lead.specimenId ?? "",
		{
			query: {
				enabled: Boolean(lead.specimenId),
			},
		},
	);

	const resolvedTitle = exactSpecimen?.specimen_reference_id ?? lead.stackTitle;

	return (
		<button
			type="button"
			className="block w-full text-left"
			onClick={onToggle}
			aria-expanded={isOpen}
		>
			<div className="relative pb-4">
				<div className="pointer-events-none absolute inset-x-3 top-2 bottom-0.5 rounded-[1.35rem] border bg-muted/45 shadow-sm" />
				<Card className="relative gap-4 border-border/80 transition-colors hover:border-foreground/20">
					<CardHeader className="pb-0">
						<div className="flex items-start justify-between gap-4">
							<div className="min-w-0 space-y-1">
								<CardDescription className="text-xs uppercase tracking-[0.18em]">
									Specimen Reference
								</CardDescription>
								<CardTitle className="truncate">{resolvedTitle}</CardTitle>
								<CardDescription className="line-clamp-2">
									{lead.stackSubtitle || "Pending specimen updates"}
								</CardDescription>
							</div>
							<div className="flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
								<Layers className="size-4" />
								<span>
									{stack.length} submission{stack.length === 1 ? "" : "s"}
								</span>
								{isOpen ? (
									<ChevronDown className="size-4" />
								) : (
									<ChevronRight className="size-4" />
								)}
							</div>
						</div>
					</CardHeader>
					<CardContent className="grid gap-3">
						<div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
							<span>Latest submission: {lead.createdAtLabel}</span>
							<span className="rounded-full bg-muted px-2 py-0.5 text-xs">
								Click to {isOpen ? "collapse" : "expand"} this stack
							</span>
						</div>
						<div className="grid gap-2">
							{stack.slice(0, Math.min(stack.length, 3)).map((entry, index) => (
								<div
									key={entry.id}
									className="rounded-xl border border-dashed bg-muted/35 px-3 py-2 text-sm text-muted-foreground"
								>
									Revision {stack.length - index} • {entry.createdAtLabel}
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</button>
	);
}

function PendingSpecimens() {
	const [status, setStatus] = useState<SpecimenStatus>("pending");
	const [refreshRotation, setRefreshRotation] = useState(0);
	const queryClient = useQueryClient();

	async function refreshPendingSpecimens() {
		setRefreshRotation((current) => current - 180);
		await queryClient.invalidateQueries({
			queryKey: ["pendingSpecimens", status],
		});
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-3">
				<div>
					<h1 className="text-xl font-semibold">Specimens</h1>
					<p className="text-sm text-muted-foreground">
						Review and manage submitted specimens
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={() => void refreshPendingSpecimens()}
					>
						<RefreshCcwIcon
							style={{
								transform: `rotate(${refreshRotation}deg)`,
								transition: "transform 900ms cubic-bezier(0.22, 1, 0.36, 1)",
							}}
						/>
						Refresh
					</Button>
					<StatusFilter value={status} onChange={setStatus} />
				</div>
			</div>
			<PendingSpecimensGrid status={status} />
		</div>
	);
}
