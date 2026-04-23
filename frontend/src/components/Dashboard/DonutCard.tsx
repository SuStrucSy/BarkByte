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

export type DonutCardMode =
	| "joinery"
	| "fastener"
	| "loadingDirection"
	| "assembly"
	| "subjoinery";

type DonutCardProps = {
	title: string;
	description: string;
	specimens: SpecimenPublic[];
	mode: DonutCardMode;
	isLoading?: boolean;
};

export function DonutCard({
	title,
	description,
	specimens,
	mode,
	isLoading = false,
}: DonutCardProps) {
	const counts = useMemo(() => {
		switch (mode) {
			case "joinery":
				return countByAttribute(
					specimens,
					(specimen) => specimen.joinery_type.label,
				);
			case "fastener":
				return countByArrayAttribute(
					specimens,
					(specimen) =>
						specimen.fastener_types.map((fastener) => fastener.label),
					"Dowel-Free",
				);
			case "loadingDirection":
				return countByArrayAttribute(specimens, (specimen) =>
					specimen.loading_directions.map((direction) => direction.label),
				);
			case "assembly":
				return countByAttribute(
					specimens,
					(specimen) => specimen.assembly_type,
				);
			case "subjoinery":
				return countByAttribute(
					specimens,
					(specimen) => specimen.sub_joinery_type.label,
				);
		}
	}, [mode, specimens]);

	if (isLoading) {
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

	return (
		<Card className="col-span-1">
			<CardHeader className="pb-4">
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className="flex items-center justify-center px-0 pb-0">
				<ChartErrorBoundary chartName="Donut">
					<Donut counts={counts} />
				</ChartErrorBoundary>
			</CardContent>
		</Card>
	);
}
