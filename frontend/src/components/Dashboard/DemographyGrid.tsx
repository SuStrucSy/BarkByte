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
import { countByArrayAttribute, countByAttribute } from "@/lib/utils";

export function DemographyGrid({ specimens }: { specimens: SpecimenPublic[] }) {
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
