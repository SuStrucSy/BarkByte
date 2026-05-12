import type { SpecimenPublic } from "@/api/model";
import { RadarMetricsChart } from "@/components/Dashboard/RadarMetricsChart";
import { cn } from "@/lib/utils";
import { getCompareGridColumnsClass } from "./compareLayout";

type CompareRadarMetricsRowProps = {
	specimens: Array<SpecimenPublic | null>;
	columnCount: number;
};

export function CompareRadarMetricsRow({
	specimens,
	columnCount,
}: CompareRadarMetricsRowProps) {
	return (
		<div
			className={cn(
				"mb-8 grid min-w-0 gap-4",
				getCompareGridColumnsClass(columnCount),
			)}
		>
			{specimens.map((specimen, slotIndex) => (
				<div
					key={`compare-radar-${specimen?.id ?? `empty-${slotIndex}`}`}
					className={`min-w-0 ${slotIndex > 0 ? "md:pl-4" : ""}`}
				>
					{specimen ? (
						<div className="grid min-w-0 gap-2 overflow-visible">
							<div className="text-center text-sm font-medium text-foreground">
								Quantitative Mechanical Measures
							</div>
							<RadarMetricsChart
								data={specimen}
								className="max-w-[320px]"
								syncId="compare-radar-metrics"
							/>
						</div>
					) : null}
				</div>
			))}
		</div>
	);
}
