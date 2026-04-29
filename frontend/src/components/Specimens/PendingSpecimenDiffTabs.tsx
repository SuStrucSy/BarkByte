import { Info, Pyramid, RulerDimensionLine } from "lucide-react";
import type {
	PendingSpecimenPublicChangedData,
	SpecimenPublic,
} from "@/api/model";
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
	isNew: boolean;
	originalSpecimen?: SpecimenPublic;
	specimen: Partial<SpecimenPublic>;
}

export function PendingSpecimenDiffTabs({
	changedData,
	isNew,
	originalSpecimen,
	specimen,
}: PendingSpecimenDiffTabsProps) {
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

	const renderTabContent = (section: keyof typeof sectionFields) => (
		<div className="px-4 pb-6 sm:px-6 lg:px-8 lg:pb-8">
			{renderSection(section)}
		</div>
	);

	return (
		<Tabs defaultValue="Meta Data">
			<TabsList>
				<TabsTrigger value="Meta Data">
					<Info /> <span className="hidden sm:inline">Meta Data</span>{" "}
					<span className="sm:hidden">Meta</span>
				</TabsTrigger>
				<TabsTrigger value="Structural Data">
					<Pyramid /> <span className="hidden sm:inline">Structural Data</span>{" "}
					<span className="sm:hidden">Structural</span>
				</TabsTrigger>
				<TabsTrigger value="Experimental Data">
					<RulerDimensionLine />
					<span className="hidden sm:inline">Experimental Data</span>{" "}
					<span className="sm:hidden">Experimental</span>
				</TabsTrigger>
			</TabsList>
			<TabsContent value="Meta Data">
				{renderTabContent("Meta Data")}
			</TabsContent>
			<TabsContent value="Structural Data">
				{renderTabContent("Structural Data")}
			</TabsContent>
			<TabsContent value="Experimental Data">
				{renderTabContent("Experimental Data")}
			</TabsContent>
		</Tabs>
	);
}
