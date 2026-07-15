import { cn } from "@/lib/utils";
import type { BackboneChartEmptyModel } from "./backboneChart.types";

type ForceDisplacementBackboneEmptyStateProps = {
	model: BackboneChartEmptyModel;
	className?: string;
};

export function ForceDisplacementBackboneEmptyState({
	model,
	className,
}: ForceDisplacementBackboneEmptyStateProps) {
	return (
		<div
			className={cn(
				"flex min-h-80 items-center justify-center rounded-md border border-dashed border-border px-4 py-6 text-sm text-muted-foreground",
				className,
			)}
		>
			<div className="space-y-1 text-center">
				<p className="font-medium text-foreground">{model.title}</p>
				<p>{model.reason}</p>
			</div>
		</div>
	);
}
