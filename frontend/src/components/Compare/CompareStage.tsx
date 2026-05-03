import { Columns3 } from "lucide-react";
import { useMemo } from "react";
import type { SpecimenPublic } from "@/api/model";
import { RadarMetricsChart } from "@/components/Dashboard/RadarMetricsChart";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
	COMPARE_SECTION_CONFIG,
	type CompareSectionTitle,
	EXPERIMENTAL_COMPARE_FIELDS,
	META_COMPARE_FIELDS,
	RADAR_METRIC_FIELDS,
	STRUCTURAL_COMPARE_FIELDS,
} from "@/lib/compare";
import {
	EXPERIMENTAL_KEYS,
	getExperimentalLabel,
	getExperimentalUnit,
} from "@/lib/constants";
import {
	cn,
	getDisplayText,
	getSpecimenDisplayLabel,
	humanizeLabel,
} from "@/lib/utils";

type CompareField = {
	key: keyof SpecimenPublic;
	render: (specimen: SpecimenPublic) => { text: string; isMissing: boolean };
};

type CompareSection = {
	title: CompareSectionTitle;
	fields: CompareField[];
};

type CompareStageProps = {
	chosenSpecimens: Array<SpecimenPublic | null>;
	columnCount: number;
};

function getCompareStageGridClass(columnCount: number) {
	return columnCount === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3";
}

function isHiddenCompareField(key: keyof SpecimenPublic) {
	return key === "id" || key.endsWith("_id");
}

const EXPERIMENTAL_KEY_SET = new Set<string>(EXPERIMENTAL_KEYS);

function isMissingCompareValue(value: unknown) {
	if (value === null || value === undefined) {
		return true;
	}

	if (typeof value === "string") {
		const normalizedValue = value.trim().toLowerCase();
		return (
			normalizedValue.length === 0 ||
			normalizedValue === "—" ||
			normalizedValue === "n/a" ||
			normalizedValue === "na" ||
			normalizedValue === "null" ||
			normalizedValue === "none"
		);
	}

	if (Array.isArray(value)) {
		return value.length === 0;
	}

	return false;
}

function getCompareLabel(key: keyof SpecimenPublic) {
	if (EXPERIMENTAL_KEY_SET.has(key)) {
		return getExperimentalLabel(key as (typeof EXPERIMENTAL_KEYS)[number]);
	}

	return humanizeLabel(key);
}

function getCompareUnit(key: keyof SpecimenPublic) {
	if (key === "moisture_percentage") {
		return "%";
	}

	if (EXPERIMENTAL_KEY_SET.has(key)) {
		return getExperimentalUnit(key as (typeof EXPERIMENTAL_KEYS)[number]);
	}

	return undefined;
}

function getMissingCompareText(key: keyof SpecimenPublic) {
	return `No ${getCompareLabel(key).toLowerCase()} information`;
}

function formatCompareValue(value: unknown): string {
	if (value === null || value === undefined || value === "") {
		return "No value";
	}

	if (typeof value === "boolean") {
		return value ? "Yes" : "No";
	}

	if (typeof value === "string" || typeof value === "number") {
		return getDisplayText(value, "Unnamed");
	}

	if (Array.isArray(value)) {
		if (value.length === 0) {
			return "No value";
		}

		return value.map((item) => formatCompareValue(item)).join(", ");
	}

	if (typeof value === "object") {
		const record = value as Record<string, unknown>;

		if (typeof record.label === "string" && record.label.trim().length > 0) {
			return record.label;
		}

		if (
			typeof record.ref_title === "string" &&
			record.ref_title.trim().length > 0
		) {
			const authors =
				typeof record.authors === "string" && record.authors.trim().length > 0
					? ` (${record.authors})`
					: "";
			return `${record.ref_title}${authors}`;
		}

		return "Unnamed";
	}

	return "No value";
}

function formatInlineCompareValue(
	key: keyof SpecimenPublic,
	value: unknown,
): { text: string; isMissing: boolean } {
	if (isMissingCompareValue(value)) {
		return { text: getMissingCompareText(key), isMissing: true };
	}

	if (key === "connector" && typeof value === "boolean") {
		return {
			text: value ? "has connector" : "has no connector",
			isMissing: false,
		};
	}

	if (key === "dowel" && typeof value === "boolean") {
		return { text: value ? "has dowel" : "has no dowel", isMissing: false };
	}

	if (key === "moisture_percentage") {
		if (typeof value !== "string") {
			return { text: getMissingCompareText(key), isMissing: true };
		}

		const normalizedValue = value.trim();
		if (!normalizedValue) {
			return { text: getMissingCompareText(key), isMissing: true };
		}

		const percentPattern = /^\d+(\.\d+)?%?$/;
		if (!percentPattern.test(normalizedValue)) {
			return { text: getMissingCompareText(key), isMissing: true };
		}

		const displayValue = normalizedValue.endsWith("%")
			? normalizedValue
			: `${normalizedValue}%`;
		return { text: `${displayValue} moisture`, isMissing: false };
	}

	if (typeof value === "number") {
		const labelOverrides: Partial<Record<keyof SpecimenPublic, string>> = {
			fastener_numbers: "fasteners",
			replicate_tests: "replicate tests",
		};
		const label = (labelOverrides[key] ?? getCompareLabel(key)).toLowerCase();
		const unit = getCompareUnit(key);

		if (unit === "%") {
			return { text: `${value}% ${label}`, isMissing: false };
		}

		if (unit) {
			return { text: `${value} ${label} (${unit})`, isMissing: false };
		}

		return { text: `${value} ${label}`, isMissing: false };
	}

	return { text: formatCompareValue(value), isMissing: false };
}

function getCompareFields(): CompareField[] {
	const orderedKeys = [
		...META_COMPARE_FIELDS,
		...STRUCTURAL_COMPARE_FIELDS,
		...EXPERIMENTAL_COMPARE_FIELDS,
	];

	const uniqueKeys = Array.from(new Set(orderedKeys)).filter(
		(key) => !isHiddenCompareField(key),
	);

	return uniqueKeys.map((key) => ({
		key,
		render: (currentSpecimen) =>
			formatInlineCompareValue(key, currentSpecimen[key]),
	}));
}

function groupCompareFields(fields: CompareField[]): CompareSection[] {
	return COMPARE_SECTION_CONFIG.map(({ title, keys }) => {
		const fieldMap = new Map(fields.map((field) => [field.key, field]));
		const sectionKeys =
			title === "Experimental Data"
				? keys.filter((key) => !RADAR_METRIC_FIELDS.includes(key))
				: keys;

		return {
			title,
			fields: sectionKeys
				.map((key) => fieldMap.get(key))
				.filter((field): field is CompareField => Boolean(field)),
		};
	}).filter((section) => section.fields.length > 0);
}

export function CompareStage({
	chosenSpecimens,
	columnCount,
}: CompareStageProps) {
	const useInternalScroll = useMediaQuery("(min-width: 1280px)");
	const hasSelectedSpecimens = chosenSpecimens.some(Boolean);
	const compareFields = useMemo(() => getCompareFields(), []);
	const compareSections = useMemo(
		() => groupCompareFields(compareFields),
		[compareFields],
	);

	if (!hasSelectedSpecimens) {
		return (
			<Empty className="border xl:min-h-0 xl:flex-1">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Columns3 className="size-5" />
					</EmptyMedia>
					<EmptyTitle>No specimens selected</EmptyTitle>
					<EmptyDescription>
						Add specimens into the slots above to populate the comparison.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	const content = (
		<div className="min-w-0">
			{compareSections.map((section, sectionIndex) => (
				<div key={section.title}>
					{sectionIndex > 0 ? <Separator /> : null}
					<div className="px-4 py-10 first:pt-8 last:pb-10">
						<div className="mb-8 text-lg font-bold uppercase tracking-[0.18em] text-foreground">
							{section.title}
						</div>
						{section.title === "Meta Data" ? (
							<div
								className={cn(
									"mb-6 grid min-w-0 gap-3",
									getCompareStageGridClass(columnCount),
								)}
							>
								{chosenSpecimens.map((specimen, slotIndex) => (
									<div
										key={`compare-card-link-${specimen?.id ?? `empty-${slotIndex}`}`}
										className={`min-w-0 text-center text-sm ${slotIndex > 0 ? "md:pl-4" : ""}`}
									>
										{specimen ? (
											<a
												href={`/specimens/${specimen.id}`}
												target="_blank"
												rel="noreferrer"
												className="font-medium underline decoration-border underline-offset-4 transition-colors hover:text-primary"
											>
												{getSpecimenDisplayLabel(specimen)}
											</a>
										) : (
											""
										)}
									</div>
								))}
							</div>
						) : null}
						{section.title === "Experimental Data" ? (
							<div
								className={cn(
									"mb-8 grid min-w-0 gap-4",
									getCompareStageGridClass(columnCount),
								)}
							>
								{chosenSpecimens.map((specimen, slotIndex) => (
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
						) : null}
						<div className="flex flex-col gap-4">
							{section.fields.map((field) => (
								<div key={field.key}>
									<div
										className={cn(
											"grid min-w-0",
											getCompareStageGridClass(columnCount),
										)}
									>
										{chosenSpecimens.map((specimen, slotIndex) => {
											const renderedValue = specimen
												? field.render(specimen)
												: null;

											return (
												<div
													key={`${field.key}-${specimen?.id ?? `empty-${slotIndex}`}`}
													className={`min-w-0 break-words whitespace-normal text-center text-sm leading-6 md:flex md:items-center md:justify-center ${renderedValue?.isMissing ? "italic text-muted-foreground" : ""} ${slotIndex > 0 ? "md:pl-4" : ""}`}
												>
													{renderedValue?.text ?? ""}
												</div>
											);
										})}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			))}
		</div>
	);

	return (
		<Card className="flex min-w-0 flex-col xl:min-h-0 xl:flex-1 xl:overflow-hidden">
			<CardHeader>
				<CardTitle>Comparison</CardTitle>
				<CardDescription>
					The comparison content scrolls inside this panel.
				</CardDescription>
			</CardHeader>
			<CardContent className="min-w-0 px-0 xl:min-h-0 xl:flex-1">
				{useInternalScroll ? (
					<ScrollArea className="h-full min-w-0 overflow-x-hidden [&>[data-slot=scroll-area-scrollbar][data-orientation=horizontal]]:hidden [&>[data-slot=scroll-area-viewport]]:overflow-x-hidden">
						{content}
					</ScrollArea>
				) : (
					content
				)}
			</CardContent>
		</Card>
	);
}
