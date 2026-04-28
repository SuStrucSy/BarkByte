import { Info, Pyramid, RulerDimensionLine } from "lucide-react";
import type { RefObject } from "react";
import type {
	PendingSpecimenPublicChangedData,
	SpecimenPublic,
} from "@/api/model";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	allSectionFields,
	fieldUnits,
	getSpecimenFieldLabel,
	isSpecimenFieldChanged,
	renderFailureModeValue,
	SpecimenDiffFieldRow,
	type SpecimenField,
	sectionFields,
} from "./specimenDiff";

interface PendingSpecimenDiffGridProps {
	changedData: PendingSpecimenPublicChangedData;
	columnsClassName: string;
	fields: SpecimenField[];
	isNew: boolean;
	originalSpecimen?: SpecimenPublic;
	specimen: Partial<SpecimenPublic>;
}

function PendingSpecimenDiffGrid({
	changedData,
	columnsClassName,
	fields,
	isNew,
	originalSpecimen,
	specimen,
}: PendingSpecimenDiffGridProps) {
	if (!fields.length) {
		return (
			<div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
				No changed attributes in this section.
			</div>
		);
	}

	const isFieldChanged = (field: SpecimenField) =>
		isSpecimenFieldChanged(field, changedData);
	const getDisplayValue = (field: SpecimenField) =>
		isNew || isFieldChanged(field)
			? specimen[field]
			: originalSpecimen?.[field];

	return (
		<div className={columnsClassName}>
			{fields.map((field) => (
				<SpecimenDiffFieldRow
					key={field}
					label={getSpecimenFieldLabel(field)}
					oldValue={originalSpecimen?.[field]}
					newValue={getDisplayValue(field)}
					isChanged={!isNew && isFieldChanged(field)}
					unit={fieldUnits[field]}
					renderOldValue={
						field === "e_qualitative_failure_measure"
							? () =>
									renderFailureModeValue(
										originalSpecimen?.e_qualitative_failure_measure,
									)
							: undefined
					}
					renderNewValue={
						field === "e_qualitative_failure_measure"
							? () =>
									renderFailureModeValue(specimen.e_qualitative_failure_measure)
							: undefined
					}
				/>
			))}
		</div>
	);
}

interface PendingSpecimenChangedOnlyProps {
	changedData: PendingSpecimenPublicChangedData;
	isNew: boolean;
	originalSpecimen?: SpecimenPublic;
	specimen: Partial<SpecimenPublic>;
}

export function PendingSpecimenChangedOnly({
	changedData,
	isNew,
	originalSpecimen,
	specimen,
}: PendingSpecimenChangedOnlyProps) {
	const fields = allSectionFields.filter((field) =>
		isSpecimenFieldChanged(field, changedData),
	);

	if (!fields.length) {
		return (
			<div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
				No changed attributes.
			</div>
		);
	}

	return (
		<PendingSpecimenDiffGrid
			changedData={changedData}
			columnsClassName="grid grid-cols-1 gap-3"
			fields={fields}
			isNew={isNew}
			originalSpecimen={originalSpecimen}
			specimen={specimen}
		/>
	);
}

interface PendingSpecimenDiffTabsProps {
	changedData: PendingSpecimenPublicChangedData;
	hasSideBySideReviewLayout: boolean;
	isNew: boolean;
	originalSpecimen?: SpecimenPublic;
	sideBySideTabContentHeight: number;
	sideBySideTabsHeaderRef: RefObject<HTMLDivElement | null>;
	specimen: Partial<SpecimenPublic>;
	usesStackedReviewLayout: boolean;
}

export function PendingSpecimenDiffTabs({
	changedData,
	hasSideBySideReviewLayout,
	isNew,
	originalSpecimen,
	sideBySideTabContentHeight,
	sideBySideTabsHeaderRef,
	specimen,
	usesStackedReviewLayout,
}: PendingSpecimenDiffTabsProps) {
	const sideBySideTabScrollStyle = {
		WebkitOverflowScrolling: "touch" as const,
	};

	const renderSection = (section: keyof typeof sectionFields) => (
		<PendingSpecimenDiffGrid
			changedData={changedData}
			columnsClassName="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3"
			fields={sectionFields[section]}
			isNew={isNew}
			originalSpecimen={originalSpecimen}
			specimen={specimen}
		/>
	);

	const renderTabContent = (section: keyof typeof sectionFields) =>
		hasSideBySideReviewLayout ? (
			<div
				data-vaul-no-drag
				className="h-full touch-pan-y overflow-y-auto pr-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
				style={sideBySideTabScrollStyle}
			>
				<div className="px-4 pb-6 sm:px-6 lg:px-8 lg:pb-8">
					<div className="grid gap-3">{renderSection(section)}</div>
				</div>
			</div>
		) : (
			<div className="px-4 pb-6 sm:px-6 lg:px-8 lg:pb-8">
				<div className="grid gap-3">{renderSection(section)}</div>
			</div>
		);

	return (
		<Tabs
			defaultValue="Meta Data"
			className={
				hasSideBySideReviewLayout
					? "grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-4"
					: "gap-4"
			}
		>
			<div
				ref={hasSideBySideReviewLayout ? sideBySideTabsHeaderRef : undefined}
				className="overflow-x-auto"
			>
				<TabsList>
					<TabsTrigger value="Meta Data">
						<Info /> {usesStackedReviewLayout ? "Meta" : "Meta Data"}
					</TabsTrigger>
					<TabsTrigger value="Structural Data">
						<Pyramid />{" "}
						{usesStackedReviewLayout ? "Structural" : "Structural Data"}
					</TabsTrigger>
					<TabsTrigger value="Experimental Data">
						<RulerDimensionLine />
						{usesStackedReviewLayout ? "Experimental" : "Experimental Data"}
					</TabsTrigger>
				</TabsList>
			</div>
			<ScrollArea>
				<div
					className={hasSideBySideReviewLayout ? "min-h-0" : ""}
					style={
						hasSideBySideReviewLayout && sideBySideTabContentHeight > 0
							? { height: `${sideBySideTabContentHeight}px` }
							: undefined
					}
				>
					<TabsContent
						value="Meta Data"
						className={hasSideBySideReviewLayout ? "h-full min-h-0" : ""}
					>
						{renderTabContent("Meta Data")}
					</TabsContent>
					<TabsContent
						value="Structural Data"
						className={hasSideBySideReviewLayout ? "h-full min-h-0" : ""}
					>
						{renderTabContent("Structural Data")}
					</TabsContent>
					<TabsContent
						value="Experimental Data"
						className={hasSideBySideReviewLayout ? "h-full min-h-0" : ""}
					>
						{renderTabContent("Experimental Data")}
					</TabsContent>
				</div>
			</ScrollArea>
		</Tabs>
	);
}
