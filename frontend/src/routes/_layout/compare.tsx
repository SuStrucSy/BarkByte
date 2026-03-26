import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Columns3, X } from "lucide-react";
import { useMemo, useState } from "react";
import { specimensReadSpecimens } from "@/api/endpoints/specimens/specimens.gen";
import type { SpecimenPublic } from "@/api/model";
import { MoistureDial } from "@/components/Dashboard/MoistureDial";
import { RadarMetricsChart } from "@/components/Dashboard/RadarMetricsChart";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@/components/ui/combobox";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
	COMPARE_SECTION_CONFIG,
	COMPARE_SLOT_COUNT,
	type CompareSectionTitle,
	EXPERIMENTAL_COMPARE_FIELDS,
	META_COMPARE_FIELDS,
	RADAR_METRIC_FIELDS,
	STRUCTURAL_CHART_FIELDS,
	STRUCTURAL_COMPARE_FIELDS,
} from "@/lib/compare";
import {
	EXPERIMENTAL_KEYS,
	getExperimentalLabel,
	getExperimentalUnit,
} from "@/lib/constants";
import { humanizeLabel, parseMoisturePercentage } from "@/lib/utils";

export const Route = createFileRoute("/_layout/compare")({
	staticData: {
		title: "Compare",
	},
	component: ComparePage,
});

type CompareField = {
	key: keyof SpecimenPublic;
	label: string;
	unit?: string;
	render: (specimen: SpecimenPublic) => { text: string; isMissing: boolean };
};

type CompareSection = {
	title: CompareSectionTitle;
	fields: CompareField[];
};

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
		return String(value);
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

		if (typeof record.id === "string" && record.id.trim().length > 0) {
			return record.id;
		}

		const scalarEntries = Object.entries(record)
			.filter(([, entryValue]) =>
				["string", "number", "boolean"].includes(typeof entryValue),
			)
			.map(
				([entryKey, entryValue]) => `${humanizeLabel(entryKey)}: ${entryValue}`,
			);

		if (scalarEntries.length > 0) {
			return scalarEntries.join(", ");
		}
	}

	return "No value";
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
		label: getCompareLabel(key),
		unit: getCompareUnit(key),
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
				: title === "Structural Data"
					? keys.filter((key) => !STRUCTURAL_CHART_FIELDS.includes(key))
					: keys;

		return {
			title,
			fields: sectionKeys
				.map((key) => fieldMap.get(key))
				.filter((field): field is CompareField => Boolean(field)),
		};
	}).filter((section) => section.fields.length > 0);
}

function useAllSpecimens() {
	return useQuery({
		queryKey: ["specimens", "compare", "all"],
		queryFn: async () => {
			const pageSize = 500;
			let skip = 0;
			let total = 0;
			let rows: SpecimenPublic[] = [];

			do {
				const response = await specimensReadSpecimens({
					skip,
					limit: pageSize,
				});
				total = response.count;
				rows = rows.concat(response.data);
				skip += pageSize;
			} while (rows.length < total);

			return rows;
		},
		staleTime: 30_000,
	});
}

function ComparePage() {
	const { data: specimens = [], isLoading, isError, error } = useAllSpecimens();
	const [selectedIds, setSelectedIds] = useState<Array<string | null>>(
		Array.from({ length: COMPARE_SLOT_COUNT }, () => null),
	);

	const selectedSpecimens = useMemo(
		() =>
			selectedIds
				.map((id) =>
					id ? specimens.find((specimen) => specimen.id === id) : undefined,
				)
				.filter((specimen): specimen is SpecimenPublic => Boolean(specimen)),
		[selectedIds, specimens],
	);
	const comparisonSlots = useMemo(
		() =>
			selectedIds.map((id) =>
				id ? (specimens.find((specimen) => specimen.id === id) ?? null) : null,
			),
		[selectedIds, specimens],
	);

	const compareFields = useMemo(() => getCompareFields(), []);
	const compareSections = useMemo(
		() => groupCompareFields(compareFields),
		[compareFields],
	);

	const getAvailableSpecimens = (slotIndex: number) => {
		const takenIds = new Set(
			selectedIds.filter(
				(selectedId, selectedIndex): selectedId is string =>
					Boolean(selectedId) && selectedIndex !== slotIndex,
			),
		);

		return specimens.filter((specimen) => !takenIds.has(specimen.id));
	};

	const setSelectedSpecimen = (slotIndex: number, specimenId: string) => {
		setSelectedIds((current) =>
			current.map((selectedId, index) =>
				index === slotIndex ? specimenId : selectedId,
			),
		);
	};

	const clearSlot = (slotIndex: number) => {
		setSelectedIds((current) =>
			current.map((selectedId, index) =>
				index === slotIndex ? null : selectedId,
			),
		);
	};

	if (isLoading) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
				Loading specimens for comparison...
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center text-sm text-destructive">
				Failed to load compare data: {error?.message || "Unknown error"}
			</div>
		);
	}

	return (
		<div className="flex h-full min-h-0 flex-col gap-6 overflow-hidden">
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{selectedIds.map((selectedId, slotIndex) => {
					const specimen = selectedId
						? (specimens.find((entry) => entry.id === selectedId) ?? null)
						: null;
					const availableSpecimens = getAvailableSpecimens(slotIndex);

					return specimen ? (
						<Item
							key={`compare-slot-${slotIndex}`}
							variant="outline"
							className="min-w-0 cursor-pointer hover:border-red-300 hover:bg-red-50 hover:text-red-800"
							role="button"
							tabIndex={0}
							aria-label={`Remove ${specimen.specimen_reference_id}`}
							onClick={() => clearSlot(slotIndex)}
							onKeyDown={(event) => {
								if (event.key === "Enter" || event.key === " ") {
									event.preventDefault();
									clearSlot(slotIndex);
								}
							}}
						>
							<ItemContent className="min-w-0">
								<ItemTitle className="group-hover/item:text-red-800">
									{specimen.specimen_reference_id}
								</ItemTitle>
								<ItemDescription className="group-hover/item:text-red-800">
									{specimen.joinery_type.label} /{" "}
									{specimen.sub_joinery_type.label}
								</ItemDescription>
								<ItemDescription className="line-clamp-2 text-xs group-hover/item:text-red-800">
									{specimen.doi.ref_title || "No reference title"}
								</ItemDescription>
							</ItemContent>
							<ItemActions className="text-muted-foreground opacity-0 transition-opacity group-hover/item:opacity-100 group-hover/item:text-red-800">
								<X className="size-4" />
							</ItemActions>
						</Item>
					) : (
						<div key={`compare-slot-${slotIndex}`} className="p-1">
							<Combobox
								items={availableSpecimens}
								itemToStringValue={(item: SpecimenPublic) => item.id}
								itemToStringLabel={(item: SpecimenPublic) =>
									`${item.specimen_reference_id} ${item.joinery_type.label} ${item.sub_joinery_type.label} ${item.doi.ref_title ?? ""} ${item.doi.authors ?? ""}`
								}
								onValueChange={(item: SpecimenPublic | null) => {
									if (item) {
										setSelectedSpecimen(slotIndex, item.id);
									}
								}}
							>
								<ComboboxInput
									placeholder="Search by ID, joinery, or reference"
									showClear
								/>
								<ComboboxContent>
									<ComboboxEmpty>No matching specimens.</ComboboxEmpty>
									<ComboboxList>
										{(candidate: SpecimenPublic) => (
											<ComboboxItem key={candidate.id} value={candidate}>
												<div className="min-w-0">
													<div className="font-medium">
														{candidate.specimen_reference_id}
													</div>
													<div className="text-muted-foreground line-clamp-1 text-xs">
														{candidate.joinery_type.label} /{" "}
														{candidate.sub_joinery_type.label}
													</div>
												</div>
											</ComboboxItem>
										)}
									</ComboboxList>
								</ComboboxContent>
							</Combobox>
						</div>
					);
				})}
			</div>

			{selectedSpecimens.length === 0 ? (
				<Empty className="min-h-0 flex-1 border">
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
			) : (
				<Card className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
					<CardHeader>
						<CardTitle>Comparison</CardTitle>
						<CardDescription>
							The comparison content scrolls inside this panel.
						</CardDescription>
					</CardHeader>
					<CardContent className="min-h-0 min-w-0 flex-1 px-0">
						<ScrollArea className="h-full min-w-0 overflow-x-hidden [&>[data-slot=scroll-area-scrollbar][data-orientation=horizontal]]:hidden [&>[data-slot=scroll-area-viewport]]:overflow-x-hidden">
							<div className="min-w-0">
								{compareSections.map((section, index) => (
									<div key={section.title}>
										{index > 0 ? <Separator /> : null}
										<div className="px-4 py-10 first:pt-8 last:pb-10">
											<div className="mb-8 text-lg font-bold uppercase tracking-[0.18em] text-foreground">
												{section.title}
											</div>
											{section.title === "Meta Data" ? (
												<div className="mb-6 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
													{comparisonSlots.map((specimen, index) => (
														<div
															key={`compare-card-link-${specimen?.id ?? `empty-${index}`}`}
															className={`min-w-0 text-center text-sm ${index > 0 ? "border-t pt-3 sm:border-t-0 sm:pt-0 sm:pl-4" : ""}`}
														>
															{specimen ? (
																<a
																	href={`/specimens/${specimen.id}`}
																	target="_blank"
																	rel="noreferrer"
																	className="font-medium underline decoration-border underline-offset-4 transition-colors hover:text-primary"
																>
																	{specimen.specimen_reference_id}
																</a>
															) : (
																""
															)}
														</div>
													))}
												</div>
											) : null}
											{section.title === "Experimental Data" ? (
												<div className="mb-8 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
													{comparisonSlots.map((specimen, index) => (
														<div
															key={`compare-radar-${specimen?.id ?? `empty-${index}`}`}
															className={`min-w-0 ${index > 0 ? "border-t pt-4 sm:border-t-0 sm:pt-0 sm:pl-4" : ""}`}
														>
															{specimen ? (
																<div className="grid min-w-0 gap-2 overflow-hidden">
																	<div className="text-center text-sm font-medium text-foreground">
																		Quantitative Mechanical Measures
																	</div>
																	<RadarMetricsChart
																		data={specimen}
																		className="max-w-[320px]"
																	/>
																</div>
															) : null}
														</div>
													))}
												</div>
											) : null}
											{section.title === "Structural Data" ? (
												<div className="mb-8 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
													{comparisonSlots.map((specimen, index) => {
														const moistureValue = parseMoisturePercentage(
															specimen?.moisture_percentage,
														);

														return (
															<div
																key={`compare-moisture-${specimen?.id ?? `empty-${index}`}`}
																className={`min-w-0 ${index > 0 ? "border-t pt-4 sm:border-t-0 sm:pt-0 sm:pl-4" : ""}`}
															>
																{specimen ? (
																	moistureValue !== null ? (
																		<div className="grid min-w-0 gap-2 overflow-hidden">
																			<MoistureDial
																				value={moistureValue}
																				label="Moisture"
																				className="mx-auto max-w-[180px]"
																				chartClassName="h-[160px] w-[160px]"
																				innerRadius={52}
																				outerRadius={72}
																			/>
																		</div>
																	) : (
																		<div className="pt-6 text-center text-sm italic text-muted-foreground">
																			No moisture percentage information
																		</div>
																	)
																) : null}
															</div>
														);
													})}
												</div>
											) : null}
											<div className="flex flex-col gap-4">
												{section.fields.map((field) => (
													<div key={field.key}>
														<div className="grid min-w-0 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
															{comparisonSlots.map((specimen, index) => {
																const renderedValue = specimen
																	? field.render(specimen)
																	: null;

																return (
																	<div
																		key={`${field.key}-${specimen?.id ?? `empty-${index}`}`}
																		className={`min-w-0 break-words whitespace-normal text-center text-sm leading-6 sm:flex sm:items-center sm:justify-center ${renderedValue?.isMissing ? "italic text-muted-foreground" : ""} ${index > 0 ? "border-t pt-3 sm:border-t-0 sm:pt-0 sm:pl-4" : ""}`}
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
						</ScrollArea>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
