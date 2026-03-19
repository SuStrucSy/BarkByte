import type { SpecimenPublic } from "@/api/model";

export type CompareSectionTitle =
  | "Meta Data"
  | "Structural Data"
  | "Experimental Data";

export const COMPARE_SLOT_COUNT = 3;

export const META_COMPARE_FIELDS: Array<keyof SpecimenPublic> = [
  "specimen_reference_id",
  "assembly_type",
  "joinery_type",
  "sub_joinery_type",
  "fastener_types",
  "loading_directions",
  "practice",
  "fastener_numbers",
  "connector",
  "dowel",
  "replicate_tests",
  "connection_description",
  "note",
  "doi",
];

export const STRUCTURAL_COMPARE_FIELDS: Array<keyof SpecimenPublic> = [
  "element_dimension",
  "moisture_percentage",
  "wood_type",
  "wood_mechanical_properties",
  "fastener_mechanical_properties",
  "connector_mechanical_properties",
];

export const EXPERIMENTAL_COMPARE_FIELDS: Array<keyof SpecimenPublic> = [
  "e_date",
  "e_test_loading_type",
  "e_yield_point_method",
  "e_qualitative_failure_measure",
  "e_qfm_description",
  "e_yield_force",
  "e_max_force",
  "e_yield_displacement",
  "e_max_displacement",
  "e_ultimate_force",
  "e_ultimate_displacement",
  "e_stiffness",
  "e_ductility",
];

export const RADAR_METRIC_FIELDS: Array<keyof SpecimenPublic> = [
  "e_yield_force",
  "e_max_force",
  "e_yield_displacement",
  "e_max_displacement",
  "e_ultimate_force",
  "e_ultimate_displacement",
  "e_stiffness",
  "e_ductility",
];

export const STRUCTURAL_CHART_FIELDS: Array<keyof SpecimenPublic> = [
  "moisture_percentage",
];

export const COMPARE_SECTION_CONFIG: Array<{
  title: CompareSectionTitle;
  keys: Array<keyof SpecimenPublic>;
}> = [
  {
    title: "Meta Data",
    keys: META_COMPARE_FIELDS,
  },
  {
    title: "Structural Data",
    keys: STRUCTURAL_COMPARE_FIELDS,
  },
  {
    title: "Experimental Data",
    keys: EXPERIMENTAL_COMPARE_FIELDS,
  },
];
