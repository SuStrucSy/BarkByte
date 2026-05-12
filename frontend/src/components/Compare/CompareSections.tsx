import type { SpecimenPublic } from "@/api/model";
import { Separator } from "@/components/ui/separator";
import { CompareFieldRows } from "./CompareFieldRows";
import { CompareRadarMetricsRow } from "./CompareRadarMetricsRow";
import type { CompareSection as CompareSectionModel } from "./CompareStage.utils";

type CompareSectionsProps = {
	sections: CompareSectionModel[];
	specimens: Array<SpecimenPublic | null>;
	columnCount: number;
};

type CompareSectionProps = {
	section: CompareSectionModel;
	specimens: Array<SpecimenPublic | null>;
	columnCount: number;
	showSeparator: boolean;
};

function CompareSection({
	section,
	specimens,
	columnCount,
	showSeparator,
}: CompareSectionProps) {
	return (
		<div>
			{showSeparator ? <Separator /> : null}
			<div className="px-4 py-10 first:pt-8 last:pb-10">
				<div className="mb-8 text-lg font-bold uppercase tracking-[0.18em] text-foreground">
					{section.title}
				</div>
				{section.title === "Experimental Data" ? (
					<CompareRadarMetricsRow
						specimens={specimens}
						columnCount={columnCount}
					/>
				) : null}

				<CompareFieldRows
					fields={section.fields}
					specimens={specimens}
					columnCount={columnCount}
				/>
			</div>
		</div>
	);
}

export function CompareSections({
	sections,
	specimens,
	columnCount,
}: CompareSectionsProps) {
	return (
		<div className="min-w-0">
			{sections.map((section, sectionIndex) => (
				<CompareSection
					key={section.title}
					section={section}
					specimens={specimens}
					columnCount={columnCount}
					showSeparator={sectionIndex > 0}
				/>
			))}
		</div>
	);
}
