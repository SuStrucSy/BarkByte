import type { SpecimenPublic } from "@/api/model";
import { ChartErrorBoundary } from "@/components/Charts/ChartErrorBoundary";
import { BoxPlot } from "@/components/Dashboard/BoxPlot";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getFullLabel } from "@/lib/constants";

const BOX_PLOT_CARD_HEIGHT = 400;
type BoxPlotChartType = "boxplot" | "violin";

type BoxPlotCardProps = {
	title: string;
	description: string;
	badgeLabel: string | null;
	data: SpecimenPublic[];
	yKey: keyof SpecimenPublic;
	chartType?: BoxPlotChartType;
	onPointClick?: (specimen: SpecimenPublic) => void;
	isLoading?: boolean;
};

export function BoxPlotCard({
	title,
	description,
	badgeLabel,
	data,
	yKey,
	chartType = "boxplot",
	onPointClick,
	isLoading = false,
}: BoxPlotCardProps) {
	const yLabel = getFullLabel(yKey);
	const mirrorPosition = chartType === "violin" ? 1 : 0;
	const descriptionContent = (
		<>
			{description}
			{!isLoading && data.length > 0 && (
				<span className="ml-2 text-xs">
					({data.length.toLocaleString()} specimens)
				</span>
			)}
		</>
	);

	const action = isLoading ? (
		<Skeleton className="h-6 w-32 rounded-full" />
	) : badgeLabel ? (
		<Badge className="border-[color:var(--failure-badge-border)] bg-[color:var(--failure-badge-bg)] text-[color:var(--failure-badge-text)]">
			{badgeLabel}
		</Badge>
	) : null;

	return (
		<Card className="col-span-1">
			<CardHeader className="grid-cols-1 gap-y-2 pb-4 has-data-[slot=card-action]:grid-cols-1 sm:gap-y-1.5">
				<CardTitle>{title}</CardTitle>
				<CardDescription className="col-start-1 row-start-2">
					{descriptionContent}
				</CardDescription>
				{action ? <CardAction>{action}</CardAction> : null}
			</CardHeader>
			<CardContent className="min-w-0 pb-4">
				{isLoading ? (
					<div className="space-y-4">
						<Skeleton className="h-[280px] w-full rounded-xl" />
						<div className="flex justify-center gap-3">
							{["axis-1", "axis-2", "axis-3", "axis-4"].map((id) => (
								<Skeleton key={id} className="h-4 w-16" />
							))}
						</div>
					</div>
				) : (
					<ChartErrorBoundary chartName="Box Plot">
						<BoxPlot
							selectedSpecimens={data}
							yKey={yKey}
							yLabel={yLabel}
							height={BOX_PLOT_CARD_HEIGHT}
							mirrorPosition={mirrorPosition}
							onPointClick={onPointClick}
						/>
					</ChartErrorBoundary>
				)}
			</CardContent>
		</Card>
	);
}
