import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardHeaderProps = {
	isLoading: boolean;
	isLoadingAll: boolean;
	loadedCount: number;
	totalCount: number;
	loadingProgress: number;
};

export function DashboardHeader({
	isLoading,
	isLoadingAll,
	loadedCount,
	totalCount,
	loadingProgress,
}: DashboardHeaderProps) {
	return (
		<Card className="py-0">
			<CardHeader className="p-6">
				<CardTitle>Specimen Analysis Dashboard</CardTitle>
				<CardDescription>
					This page brings the specimen dataset into one place with distribution
					views, point-level comparisons, and reference context for faster
					exploration.
				</CardDescription>
				<div className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
					{isLoading ? (
						<>
							<Skeleton className="h-5 w-28" />
							<Skeleton className="h-6 w-28 rounded-full" />
						</>
					) : (
						<>
							{loadedCount.toLocaleString()} / {totalCount.toLocaleString()}{" "}
							specimens
						</>
					)}
					{!isLoading &&
						(isLoadingAll ? (
							<Badge
								variant="secondary"
								className="animate-pulse"
								aria-live="polite"
							>
								Loading... {loadingProgress}%
							</Badge>
						) : (
							<Badge aria-label="All specimens loaded">✓ Complete</Badge>
						))}
				</div>
			</CardHeader>
		</Card>
	);
}
