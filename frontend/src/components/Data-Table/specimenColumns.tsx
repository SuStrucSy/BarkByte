// specimenColumns.ts - Complete updated file
import type { ColumnDef } from "@tanstack/react-table";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { SpecimenPublic } from "@/api/model";
import { FailureModeBadge } from "@/components/Common/FailureModeBadge";
import {
	Popover,
	PopoverContent,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "@/components/ui/popover";
import { DataTableColumnHeader } from "./data-table-column-header";

type SpecimenPublicKey = keyof SpecimenPublic;

interface ColumnConfig {
	header: string;
	sortable?: boolean;
	hidden?: boolean;
	meta?: {
		label?: string;
		renderAs?: string; // e.g. 'joinery_label', 'array_join'
		// Add any custom props you need
	};
}

interface CreateColumnsOptions {
	onFailureModeClick?: (failureMode: string) => void;
}

interface FailureModeBadgeListProps {
	items: string[];
	onFailureModeClick?: (failureMode: string) => void;
}

function FailureModeBadgeList({
	items,
	onFailureModeClick,
}: FailureModeBadgeListProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const badgeRefs = useRef<Array<HTMLSpanElement | null>>([]);
	const counterRefs = useRef<Record<number, HTMLSpanElement | null>>({});
	const [availableWidth, setAvailableWidth] = useState(0);
	const [visibleCount, setVisibleCount] = useState(items.length);
	const badgeEntries = useMemo(() => {
		const occurrences = new Map<string, number>();
		return items.map((label) => {
			const occurrence = (occurrences.get(label) ?? 0) + 1;
			occurrences.set(label, occurrence);
			return {
				key: `${label}-${occurrence}`,
				label,
			};
		});
	}, [items]);
	const hiddenCounts = useMemo(
		() => Array.from({ length: items.length }, (_, index) => index + 1),
		[items.length],
	);

	useLayoutEffect(() => {
		const container = containerRef.current;
		const cell = container?.closest("td");
		if (!container || !cell) {
			return;
		}

		const measure = () => {
			const cellStyle = window.getComputedStyle(cell);
			const horizontalPadding =
				Number.parseFloat(cellStyle.paddingLeft || "0") +
				Number.parseFloat(cellStyle.paddingRight || "0");
			const nextAvailableWidth = Math.max(
				cell.clientWidth - horizontalPadding,
				0,
			);

			if (nextAvailableWidth <= 0) {
				return;
			}
			setAvailableWidth((current) =>
				current === nextAvailableWidth ? current : nextAvailableWidth,
			);

			const computedStyle = window.getComputedStyle(container);
			const gap = Number.parseFloat(
				computedStyle.columnGap || computedStyle.gap || "0",
			);
			const badgeWidths = badgeEntries.map(
				(_, index) => badgeRefs.current[index]?.offsetWidth ?? 0,
			);

			let nextVisibleCount = items.length;

			for (let count = items.length; count >= 0; count -= 1) {
				const hiddenCount = items.length - count;
				const visibleWidth = badgeWidths
					.slice(0, count)
					.reduce((total, width) => total + width, 0);
				const visibleGapWidth = count > 1 ? gap * (count - 1) : 0;
				const counterWidth =
					hiddenCount > 0
						? (counterRefs.current[hiddenCount]?.offsetWidth ?? 0) +
							(count > 0 ? gap : 0)
						: 0;

				if (
					visibleWidth + visibleGapWidth + counterWidth <=
					nextAvailableWidth
				) {
					nextVisibleCount = count;
					break;
				}
			}

			setVisibleCount((current) =>
				current === nextVisibleCount ? current : nextVisibleCount,
			);
		};

		measure();

		const resizeObserver = new ResizeObserver(() => {
			measure();
		});

		resizeObserver.observe(cell);

		return () => {
			resizeObserver.disconnect();
		};
	}, [badgeEntries, items]);

	const hiddenCount = Math.max(items.length - visibleCount, 0);
	const hiddenItems = badgeEntries.slice(visibleCount);

	return (
		<div className="relative max-w-[30rem] min-w-0 w-full">
			<div
				ref={containerRef}
				className="flex h-6 min-w-0 w-full items-center gap-1 overflow-hidden whitespace-nowrap"
				style={availableWidth > 0 ? { width: availableWidth } : undefined}
			>
				{badgeEntries.slice(0, visibleCount).map((item) => (
					<FailureModeBadge
						key={item.key}
						label={item.label}
						onClick={(event) => {
							event.stopPropagation();
							onFailureModeClick?.(item.label);
						}}
					>
						{item.label}
					</FailureModeBadge>
				))}
				{hiddenCount > 0 ? (
					<Popover>
						<PopoverTrigger asChild>
							<FailureModeBadge
								label={`+${hiddenCount}`}
								onClick={(event) => {
									event.stopPropagation();
								}}
							>
								+{hiddenCount}
							</FailureModeBadge>
						</PopoverTrigger>
						<PopoverContent
							align="start"
							className="w-auto max-w-80 p-3"
							onClick={(event) => {
								event.stopPropagation();
							}}
						>
							<PopoverHeader className="mb-2">
								<PopoverTitle className="text-xs font-medium text-muted-foreground">
									Hidden failure modes
								</PopoverTitle>
							</PopoverHeader>
							<div className="flex flex-wrap gap-1.5">
								{hiddenItems.map((item) => (
									<FailureModeBadge
										key={item.key}
										label={item.label}
										onClick={(event) => {
											event.stopPropagation();
											onFailureModeClick?.(item.label);
										}}
									>
										{item.label}
									</FailureModeBadge>
								))}
							</div>
						</PopoverContent>
					</Popover>
				) : null}
			</div>
			<div className="pointer-events-none absolute -z-10 h-0 overflow-hidden opacity-0">
				<div className="flex items-center gap-1 whitespace-nowrap">
					{badgeEntries.map((item, index) => (
						<span
							key={item.key}
							ref={(element) => {
								badgeRefs.current[index] = element;
							}}
						>
							<FailureModeBadge label={item.label}>
								{item.label}
							</FailureModeBadge>
						</span>
					))}
					{hiddenCounts.map((count) => (
						<span
							key={count}
							ref={(element) => {
								counterRefs.current[count] = element;
							}}
						>
							<FailureModeBadge label={`+${count}`}>+{count}</FailureModeBadge>
						</span>
					))}
				</div>
			</div>
		</div>
	);
}

const columnConfig: Record<SpecimenPublicKey, ColumnConfig> = {
	// Hidden by default
	id: { header: "ID", hidden: true },
	note: { header: "Notes", hidden: true },
	connector_mechanical_properties: { header: "Connector Props", hidden: true },
	fastener_mechanical_properties: { header: "Fastener Props", hidden: true },
	wood_mechanical_properties: { header: "Wood Props", hidden: true },

	// Visible columns are sortable by default unless explicitly disabled.
	specimen_reference_id: { header: "Reference ID" },
	doi: { header: "DOI", hidden: true, meta: { renderAs: "doi_label" } },
	assembly_type: { header: "Assembly Type" },

	connector: { header: "Connector" },

	dowel: { header: "Dowel" },

	joinery_type: {
		header: "Joinery Type",
		meta: { renderAs: "joinery_label" },
	},
	sub_joinery_type: {
		header: "Sub Joinery",
		meta: { renderAs: "sub_joinery_label" },
	},
	loading_directions: {
		header: "Loading Directions",
		meta: { renderAs: "array_labels" },
	},
	practice: { header: "Practice" },
	moisture_percentage: { header: "Moisture %" },

	replicate_tests: { header: "Replicates" },
	e_date: { header: "Test Date", hidden: true },
	e_yield_force: { header: "Yield Force (KN)" },
	e_max_force: { header: "Max Force (KN)" },
	e_yield_displacement: { header: "Yield Disp (mm)" },
	e_max_displacement: { header: "Max Disp (mm)" },
	e_ultimate_force: { header: "Ultimate Force (KN)" },
	e_ultimate_displacement: { header: "Ultimate Disp (mm)" },
	e_stiffness: { header: "Stiffness (KN/mm)" },
	e_ductility: { header: "Ductility" },
	e_qualitative_failure_measure: {
		header: "Failure Mode",
		sortable: false,
		meta: { renderAs: "array_badges" },
	},
	e_qfm_description: { header: "Failure Desc", hidden: true },
	e_test_loading_type: { header: "Loading Type" },
	e_yield_point_method: { header: "Yield Method" },
	wood_type: { header: "Wood Type", hidden: true },
	fastener_types: {
		header: "Fastener Types",
		meta: { renderAs: "array_labels" },
	},
	fastener_numbers: { header: "Fastener Count", hidden: true },
	connection_description: { header: "Connection Desc", hidden: true },
	element_dimension: { header: "Dimensions", hidden: true },
};

export const createColumns = <TData extends SpecimenPublic>(
	options: CreateColumnsOptions = {},
): ColumnDef<TData>[] =>
	Object.entries(columnConfig)
		.filter(([key]) => key !== "id")
		.map(([key, config]) => {
			const baseColumn = {
				id: key,
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title={config.header} />
				),
				meta: {
					label: config.header,
					...config.meta,
				},
				enableSorting: config.sortable ?? true,
			} satisfies Partial<ColumnDef<TData>>;

			switch (config.meta?.renderAs) {
				case "joinery_label":
					return {
						...baseColumn,
						accessorFn: (row) => row.joinery_type?.label ?? "",
					} satisfies ColumnDef<TData>;
				case "sub_joinery_label":
					return {
						...baseColumn,
						accessorFn: (row) => row.sub_joinery_type?.label ?? "",
					} satisfies ColumnDef<TData>;
				case "doi_label":
					return {
						...baseColumn,
						accessorFn: (row) => row.doi?.ref_title ?? "Unnamed",
					} satisfies ColumnDef<TData>;
				case "array_labels":
					return {
						...baseColumn,
						accessorFn: (row) =>
							(row[key] as Array<{ label?: string }> | undefined)
								?.map((item) => item?.label ?? "")
								.filter(Boolean)
								.join(", ") ?? "",
					} satisfies ColumnDef<TData>;
				case "array_badges":
					return {
						...baseColumn,
						accessorFn: (row) =>
							(row[key] as Array<{ label?: string }> | undefined)
								?.map((item) => item?.label ?? "")
								.filter(Boolean)
								.join(", ") ?? "",
						cell: ({ row }) => {
							const items = (
								(row.original[key] as
									| Array<{
											label?: string;
									  }>
									| undefined) ?? []
							)
								.map((item) => item?.label ?? "")
								.filter(Boolean);

							if (items.length === 0) {
								return "None";
							}

							return (
								<FailureModeBadgeList
									items={items}
									onFailureModeClick={options.onFailureModeClick}
								/>
							);
						},
					} satisfies ColumnDef<TData>;
				case "array_join":
					return {
						...baseColumn,
						accessorFn: (row) =>
							(Array.isArray(row[key]) ? row[key].join(", ") : row[key]) ?? "",
					} satisfies ColumnDef<TData>;
				default:
					return {
						...baseColumn,
						accessorKey: key,
					} satisfies ColumnDef<TData>;
			}
		});

// ✅ Exports initial visibility from config
export const getInitialColumnVisibility = (): Record<string, boolean> => {
	const hiddenColumns: Record<string, boolean> = {};
	Object.entries(columnConfig).forEach(([key, config]) => {
		if (config.hidden) {
			hiddenColumns[key] = false;
		}
	});
	return hiddenColumns;
};
