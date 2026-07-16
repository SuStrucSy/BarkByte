import type { ReactNode } from "react";
import { ChartErrorBoundary } from "@/components/Charts/ChartErrorBoundary";
import { ExpandableChart } from "@/components/Charts/ExpandableChart";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type ScatterPlotCardProps = {
	title: string;
	description: string;
	pointCount: number;
	isLoading?: boolean;
	children: ({ isExpanded }: { isExpanded: boolean }) => ReactNode;
};

export function ScatterPlotCard({
	title,
	description,
	pointCount,
	isLoading = false,
	children,
}: ScatterPlotCardProps) {
	const descriptionContent = (
		<>
			{description}
			{pointCount > 0 && (
				<span className="ml-2 text-xs">
					({pointCount.toLocaleString()} points)
				</span>
			)}
		</>
	);

	const action = isLoading ? (
		<Skeleton className="hidden h-9 w-9 rounded-full lg:block" />
	) : (
		<div className="hidden lg:block">
			<ExpandableChart title={title}>
				{() => children({ isExpanded: true })}
			</ExpandableChart>
		</div>
	);

	return (
		<Card>
			<CardHeader className="gap-y-2 pb-3 has-data-[slot=card-action]:grid-cols-1 lg:gap-y-1.5 lg:pb-4 lg:has-data-[slot=card-action]:grid-cols-[1fr_auto]">
				<CardTitle>{title}</CardTitle>
				<CardDescription className="col-start-1 row-start-2">
					{descriptionContent}
				</CardDescription>
				{action ? <CardAction>{action}</CardAction> : null}
			</CardHeader>
			<CardContent className="pb-4">
				{isLoading ? (
					<div className="space-y-4">
						<Skeleton className="h-[280px] w-full rounded-xl" />
						<div className="flex flex-wrap justify-center gap-3 pt-1">
							{["legend-1", "legend-2", "legend-3"].map((id) => (
								<div key={id} className="flex items-center gap-2">
									<Skeleton className="h-4 w-4 rounded-full" />
									<Skeleton className="h-4 w-24" />
								</div>
							))}
						</div>
					</div>
				) : (
					<ChartErrorBoundary chartName={title}>
						{children({ isExpanded: false })}
					</ChartErrorBoundary>
				)}
			</CardContent>
		</Card>
	);
}
