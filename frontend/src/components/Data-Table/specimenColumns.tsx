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
	uploader_id: { header: "Uploader ID", hidden: true },
	note: { header: "Notes", hidden: true },
	connector_mechanical_properties: { header: "Connector Props", hidden: true },
	fastener_mechanical_properties: { header: "Fastener Props", hidden: true },
	wood_mechanical_properties: { header: "Wood Props", hidden: true },

	// Visible columns (sortable where appropriate)
	specimen_reference_id: { header: "Reference ID", sortable: true },
	assembly_type: { header: "Assembly Type", sortable: true },
	connection_description: { header: "Connection Desc" },
	connector: { header: "Connector" },
	doi: { header: "DOI", sortable: true },
	dowel: { header: "Dowel" },
	element_dimension: { header: "Dimensions" },
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
	loading_directions: { header: "Loading Directions" },
	moisture_percentage: { header: "Moisture %", sortable: true },
	practice: { header: "Practice", sortable: true },
	replicate_tests: { header: "Replicates", sortable: true },
	e_date: { header: "Test Date", sortable: true },
	e_yield_force: { header: "Yield Force", sortable: true },
	e_max_force: { header: "Max Force", sortable: true },
	e_yield_displacement: { header: "Yield Disp" },
	e_max_displacement: { header: "Max Disp" },
	e_ultimate_force: { header: "Ultimate Force" },
	e_ultimate_displacement: { header: "Ultimate Disp" },
	e_stiffness: { header: "Stiffness" },
	e_ductility: { header: "Ductility" },
	e_qualitative_failure_measure: { header: "Failure Mode" },
	e_qfm_description: { header: "Failure Desc" },
	e_test_loading_type: { header: "Loading Type" },
	e_yield_point_method: { header: "Yield Method" },
	e_measurement_unit: { header: "Units" },
	wood_type: { header: "Wood Type" },
	fastener_types: {
		header: "Fastener Types",
		meta: { renderAs: "array_labels" },
	},
	fastener_numbers: { header: "Fastener Count", sortable: true },
};

export const createColumns = <
	TData extends SpecimenPublic,
>(): ColumnDef<TData>[] =>
	Object.entries(columnConfig).map(([key, config]) => ({
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
