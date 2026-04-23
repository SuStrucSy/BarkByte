import { useMemo } from "react";
import type { SpecimenPublic } from "@/api/model";
import { ChartErrorBoundary } from "@/components/Charts/ChartErrorBoundary";
import { Donut } from "@/components/Charts/Donut";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { countByArrayAttribute, countByAttribute } from "@/lib/utils";

function DemographyCardSkeleton() {
	return (
		<Card className="col-span-1">
			<CardHeader className="pb-4">
				<Skeleton className="h-5 w-52" />
				<Skeleton className="h-4 w-64 max-w-full" />
			</CardHeader>
			<CardContent className="flex items-center justify-center px-0 pb-0">
				<Skeleton className="h-56 w-56 rounded-full" />
			</CardContent>
		</Card>
	);
}

export function DemographyGrid({
	specimens,
	isLoading = false,
}: {
	specimens: SpecimenPublic[];
	isLoading?: boolean;
}) {
	const joineryCounts = useMemo(
		() => countByAttribute(specimens, (s) => s.joinery_type.label),
		[specimens],
	);

	const fastenerCounts = useMemo(
		() =>
			countByArrayAttribute(
				specimens,
				(s) => s.fastener_types.map((f) => f.label),
				"Dowel-Free",
			),
		[specimens],
	);

	const loadingDirectionCounts = useMemo(
		() =>
			countByArrayAttribute(specimens, (s) =>
				s.loading_directions.map((l) => l.label),
			),
		[specimens],
	);

	const assemblyCounts = useMemo(
		() => countByAttribute(specimens, (s) => s.assembly_type),
		[specimens],
	);

	const subjoineryCounts = useMemo(
		() => countByAttribute(specimens, (s) => s.sub_joinery_type.label),
		[specimens],
	);

	if (isLoading) {
		return (
			<>
				{[
					"demography-joinery",
					"demography-fastener",
					"demography-loading",
					"demography-assembly",
					"demography-subjoinery",
				].map((key) => (
					<DemographyCardSkeleton key={key} />
				))}
			</>
		);
	}

	return (
		<>
			<Card className="col-span-1">
				<CardHeader className="pb-4">
					<CardTitle>Specimens by Joinery Type</CardTitle>
					<CardDescription>
						How specimens are distributed across joinery types
					</CardDescription>
				</CardHeader>
				<CardContent className="flex items-center justify-center px-0 pb-0">
					<ChartErrorBoundary chartName="Donut">
						<Donut counts={joineryCounts} />
					</ChartErrorBoundary>
				</CardContent>
			</Card>
			<Card className="col-span-1">
				<CardHeader className="pb-4">
					<CardTitle>Specimens by Fastener Type</CardTitle>
					<CardDescription>
						How specimens are distributed across fastener types
					</CardDescription>
				</CardHeader>
				<CardContent className="flex items-center justify-center px-0 pb-0">
					<ChartErrorBoundary chartName="Donut">
						<Donut counts={fastenerCounts} />
					</ChartErrorBoundary>
				</CardContent>
			</Card>
			<Card className="col-span-1">
				<CardHeader className="pb-4">
					<CardTitle>Specimens by Loading Direction</CardTitle>
					<CardDescription>
						How specimens are distributed across loading directions
					</CardDescription>
				</CardHeader>
				<CardContent className="flex items-center justify-center px-0 pb-0">
					<ChartErrorBoundary chartName="Donut">
						<Donut counts={loadingDirectionCounts} />
					</ChartErrorBoundary>
				</CardContent>
			</Card>
			<Card className="col-span-1">
				<CardHeader className="pb-4">
					<CardTitle>Specimens by Assembly Type</CardTitle>
					<CardDescription>
						How specimens are distributed across assembly types
					</CardDescription>
				</CardHeader>
				<CardContent className="flex items-center justify-center px-0 pb-0">
					<ChartErrorBoundary chartName="Donut">
						<Donut counts={assemblyCounts} />
					</ChartErrorBoundary>
				</CardContent>
			</Card>
			<Card className="col-span-1">
				<CardHeader className="pb-4">
					<CardTitle>Specimens by Sub-Joinery Type</CardTitle>
					<CardDescription>
						How specimens are distributed across sub-joinery types
					</CardDescription>
				</CardHeader>
				<CardContent className="flex items-center justify-center px-0 pb-0">
					<ChartErrorBoundary chartName="Donut">
						<Donut counts={subjoineryCounts} />
					</ChartErrorBoundary>
				</CardContent>
			</Card>
		</>
	);
}
