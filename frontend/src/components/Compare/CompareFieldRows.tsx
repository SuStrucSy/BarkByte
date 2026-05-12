import { Link } from "@tanstack/react-router";
import type { SpecimenPublic } from "@/api/model";
import { cn } from "@/lib/utils";
import type { CompareField } from "./CompareStage.utils";
import { getCompareGridColumnsClass } from "./compareLayout";

type CompareFieldRowsProps = {
	fields: CompareField[];
	specimens: Array<SpecimenPublic | null>;
	columnCount: number;
};

type CompareFieldRowProps = {
	field: CompareField;
	specimens: Array<SpecimenPublic | null>;
	columnCount: number;
};

function CompareFieldRow({
	field,
	specimens,
	columnCount,
}: CompareFieldRowProps) {
	return (
		<div
			className={cn("grid min-w-0", getCompareGridColumnsClass(columnCount))}
		>
			{specimens.map((specimen, slotIndex) => {
				const renderedValue = specimen ? field.render(specimen) : null;
				const renderedText = renderedValue?.text ?? "";

				return (
					<div
						key={`${field.key}-${specimen?.id ?? `empty-${slotIndex}`}`}
						className={`min-w-0 break-words whitespace-normal text-center text-sm leading-6 md:flex md:items-center md:justify-center ${renderedValue?.isMissing ? "italic text-muted-foreground" : ""} ${slotIndex > 0 ? "md:pl-4" : ""}`}
					>
						{field.key === "specimen_reference_id" && specimen ? (
							<Link
								to="/specimens/$specimenId"
								params={{ specimenId: specimen.id }}
								className="font-medium underline decoration-border underline-offset-4 transition-colors hover:text-primary"
							>
								{renderedText}
							</Link>
						) : (
							renderedText
						)}
					</div>
				);
			})}
		</div>
	);
}

export function CompareFieldRows({
	fields,
	specimens,
	columnCount,
}: CompareFieldRowsProps) {
	return (
		<div className="flex flex-col gap-4">
			{fields.map((field) => (
				<CompareFieldRow
					key={field.key}
					field={field}
					specimens={specimens}
					columnCount={columnCount}
				/>
				
			))}
		</div>
	);
}
