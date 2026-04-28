import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Layers, RefreshCcwIcon } from "lucide-react";
import { useState } from "react";
import { SkeletonCard } from "@/components/Skeleton/SkeletonCard";
import { PendingSpecimenStack } from "@/components/Specimens/PendingSpecimenStack";
import {
	buildPendingSpecimenCards,
	getPendingSpecimenStackPreview,
	groupPendingSpecimenCards,
} from "@/components/Specimens/pendingSpecimenUtils";
import { SpecimenPendingCard } from "@/components/Specimens/SpecimenPendingCard";
import {
	type SpecimenStatus,
	StatusFilter,
} from "@/components/Specimens/SpecimenStatusFilter";
import { usePendingSpecimens } from "@/components/Specimens/usePendingSpecimens";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";

export const Route = createFileRoute(
	"/_layout/_authenticated/specimens/pending",
)({
	staticData: {
		title: "Pending",
	},
	component: PendingSpecimens,
});

function PendingSpecimensContent({ status }: { status: SpecimenStatus }) {
	const { actions, currentUser, data, isLoading, lookups, reviewState } =
		usePendingSpecimens(status);

	if (isLoading) {
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
			<div className="p-4 md:px-0">
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
			</div>
		);
	}

	const pendingCards = buildPendingSpecimenCards({
		actions,
		currentUser,
		lookups,
		pendingSpecimens: data.pending_specimens,
		reviewState,
		status,
	});
	const groupedStacks = groupPendingSpecimenCards(pendingCards);

	return (
		<div className="p-4 md:px-0 grid gap-6 xl:grid-cols-2">
			{groupedStacks.map((stack) => {
				const lead = stack[0];
				const hasMultiple = stack.length > 1;

				if (!hasMultiple) {
					return (
						<div key={lead.stackId} className="min-w-0">
							<SpecimenPendingCard {...lead.cardProps} />
						</div>
					);
				}

				return (
					<PendingSpecimenStack
						key={lead.stackId}
						preview={getPendingSpecimenStackPreview(stack)}
					>
						{stack.map((pending) => (
							<SpecimenPendingCard key={pending.id} {...pending.cardProps} />
						))}
					</PendingSpecimenStack>
				);
			})}
		</div>
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
		<div>
			<div className="flex items-end justify-between gap-3 p-4 md:p-0">
				<div className="space-y-3">
					<div>
						<h1 className="text-xl font-semibold">Specimens</h1>
						<p className="text-sm text-muted-foreground">
							Review and manage submitted specimens
						</p>
					</div>
					<StatusFilter value={status} onChange={setStatus} />
				</div>
				<Button
					type="button"
					variant="outline"
					size="icon"
					onClick={() => void refreshPendingSpecimens()}
					aria-label="Refresh pending specimens"
					title="Refresh pending specimens"
				>
					<RefreshCcwIcon
						style={{
							transform: `rotate(${refreshRotation}deg)`,
							transition: "transform 900ms cubic-bezier(0.22, 1, 0.36, 1)",
						}}
					/>
				</Button>
			</div>
			<PendingSpecimensContent status={status} />
		</div>
	);
}
