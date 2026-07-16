import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { ForceDisplacementMetricBadge } from "./forceDisplacementBackboneChart.utils";

type ForceDisplacementMetricBadgesProps = {
	labels: ForceDisplacementMetricBadge[];
};

export function ForceDisplacementMetricBadges({
	labels,
}: ForceDisplacementMetricBadgesProps) {
	if (labels.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-wrap gap-2 pb-3">
			{labels.map((badge) => (
				<ForceDisplacementMetricBadgePopover key={badge.label} badge={badge} />
			))}
		</div>
	);
}

function ForceDisplacementMetricBadgePopover({
	badge,
}: {
	badge: ForceDisplacementMetricBadge;
}) {
	const [open, setOpen] = useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Badge asChild variant="secondary" className="bg-muted text-foreground">
					<button
						type="button"
						aria-label={`${badge.label}: ${badge.name}`}
						onMouseEnter={() => setOpen(true)}
						onMouseLeave={() => setOpen(false)}
					>
						{badge.label}
					</button>
				</Badge>
			</PopoverTrigger>
			<PopoverContent
				side="top"
				className="w-auto max-w-64 px-3 py-2 text-xs font-medium"
				onMouseEnter={() => setOpen(true)}
				onMouseLeave={() => setOpen(false)}
			>
				{badge.name}
			</PopoverContent>
		</Popover>
	);
}
