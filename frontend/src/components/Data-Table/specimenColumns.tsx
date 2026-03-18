// specimenColumns.ts - Complete updated file
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import type { SpecimenPublic } from "@/api/model";
import { FailureModeBadge } from "@/components/Common/FailureModeBadge";

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

const columnConfig: Record<SpecimenPublicKey, ColumnConfig> = {
	// Hidden by default
	id: { header: "ID", hidden: true },
	uploader_id: { header: "Uploader", hidden: true },
	note: { header: "Notes", hidden: true },
	connector_mechanical_properties: { header: "Connector Props", hidden: true },
	fastener_mechanical_properties: { header: "Fastener Props", hidden: true },
	wood_mechanical_properties: { header: "Wood Props", hidden: true },

	// Visible columns are sortable by default unless explicitly disabled.
	specimen_reference_id: { header: "Reference ID" },
	doi: { header: "DOI", hidden: true },
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

export const createColumns = <
	TData extends SpecimenPublic,
>(options: CreateColumnsOptions = {}): ColumnDef<TData>[] =>
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
				case "array_labels":
					return {
						...baseColumn,
						accessorFn: (row) =>
							((row as any)[key] as Array<{ label?: string }> | undefined)
								?.map((item) => item?.label ?? "")
								.filter(Boolean)
								.join(", ") ?? "",
					} satisfies ColumnDef<TData>;
				case "array_badges":
					return {
						...baseColumn,
						accessorFn: (row) =>
							((row as any)[key] as Array<{ label?: string }> | undefined)
								?.map((item) => item?.label ?? "")
								.filter(Boolean)
								.join(", ") ?? "",
						cell: ({ row }) => {
							const items = (((row.original as any)[key] as Array<{
								label?: string;
							}> | undefined) ?? [])
								.map((item) => item?.label ?? "")
								.filter(Boolean);

							if (items.length === 0) {
								return "None";
							}

							return (
								<div className="flex max-w-[18rem] flex-wrap gap-1">
									{items.map((item) => (
										<FailureModeBadge
											key={item}
											label={item}
											onClick={(event) => {
												event.stopPropagation();
												options.onFailureModeClick?.(item);
											}}
										>
											{item}
										</FailureModeBadge>
									))}
								</div>
							);
						},
					} satisfies ColumnDef<TData>;
				case "array_join":
					return {
						...baseColumn,
						accessorFn: (row) =>
							(Array.isArray((row as any)[key])
								? (row as any)[key].join(", ")
								: (row as any)[key]) ?? "",
					} satisfies ColumnDef<TData>;
				default:
					return {
						...baseColumn,
						accessorKey: key as any,
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
