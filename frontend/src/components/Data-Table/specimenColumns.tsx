// specimenColumns.ts - Complete updated file
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import type { SpecimenPublic } from "@/api/model";

type SpecimenPublicKey = keyof SpecimenPublic;

interface ColumnConfig {
	header: string;
	sortable?: boolean;
	hidden?: boolean;
	meta?: {
		renderAs?: string; // e.g. 'joinery_label', 'array_join'
		// Add any custom props you need
	};
}

const columnConfig: Record<SpecimenPublicKey, ColumnConfig> = {
	// Hidden by default
	id: { header: "ID", hidden: true },
	uploader_id: { header: "Uploader", hidden: true, meta: { renderAs: "uploader_name" } },
	note: { header: "Notes", hidden: true },
	connector_mechanical_properties: { header: "Connector Props", hidden: true },
	fastener_mechanical_properties: { header: "Fastener Props", hidden: true },
	wood_mechanical_properties: { header: "Wood Props", hidden: true },

	// Visible columns (sortable where appropriate)
	specimen_reference_id: { header: "Reference ID", sortable: true },
	doi: { header: "DOI", sortable: true, hidden: true },
	assembly_type: { header: "Assembly Type", sortable: true },

	connector: { header: "Connector" },

	dowel: { header: "Dowel" },

	joinery_type: {
		header: "Joinery Type",
		sortable: true,
		meta: { renderAs: "joinery_label" },
	},
	sub_joinery_type: {
		header: "Sub Joinery",
		sortable: true,
		meta: { renderAs: "sub_joinery_label" },
	},
	loading_directions: {
		header: "Loading Directions",
		meta: { renderAs: "array_labels" },
	},
	practice: { header: "Practice", sortable: true },
	moisture_percentage: { header: "Moisture %", sortable: true },

	replicate_tests: { header: "Replicates", sortable: true },
	e_date: { header: "Test Date", sortable: true, hidden: true },
	e_yield_force: { header: "Yield Force (KN)", sortable: true },
	e_max_force: { header: "Max Force (KN)", sortable: true },
	e_yield_displacement: { header: "Yield Disp (mm)" },
	e_max_displacement: { header: "Max Disp (mm)" },
	e_ultimate_force: { header: "Ultimate Force (KN)" },
	e_ultimate_displacement: { header: "Ultimate Disp (mm)" },
	e_stiffness: { header: "Stiffness (KN/mm)" },
	e_ductility: { header: "Ductility" },
	e_qualitative_failure_measure: {
		header: "Failure Mode",
		meta: { renderAs: "array_labels" },
	},
	e_qfm_description: { header: "Failure Desc", hidden: true },
	e_test_loading_type: { header: "Loading Type" },
	e_yield_point_method: { header: "Yield Method" },
	wood_type: { header: "Wood Type", hidden: true },
	fastener_types: {
		header: "Fastener Types",
		meta: { renderAs: "array_labels" },
	},
	fastener_numbers: { header: "Fastener Count", sortable: true, hidden: true },
	connection_description: { header: "Connection Desc", hidden: true },
	element_dimension: { header: "Dimensions", hidden: true },
};

export const createColumns = <
	TData extends SpecimenPublic,
>(): ColumnDef<TData>[] =>
	Object.entries(columnConfig)
		.filter(([key]) => key !== "id")
		.map(([key, config]) => ({
			id: key,
			accessorKey: key as any,
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title={config.header} />
			),
			meta: config.meta,
			enableSorting: config.sortable ?? false,
		}));

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
