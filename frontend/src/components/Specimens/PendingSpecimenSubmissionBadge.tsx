import { LayersPlus, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SpecimenStatus } from "./SpecimenStatusFilter";

interface PendingSpecimenSubmissionBadgeProps {
	isNew: boolean;
	status: SpecimenStatus;
	className?: string;
}

export function PendingSpecimenSubmissionBadge({
	isNew,
	status,
	className,
}: PendingSpecimenSubmissionBadgeProps) {
	if (status !== "pending") return null;

	return isNew ? (
		<Badge
			className={
				className ??
				"bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
			}
		>
			<LayersPlus data-icon="inline-start" />
			New
		</Badge>
	) : (
		<Badge
			className={
				className ?? "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
			}
		>
			<Pencil data-icon="inline-start" />
			Update
		</Badge>
	);
}
