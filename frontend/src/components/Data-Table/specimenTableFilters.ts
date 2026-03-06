import type { SpecimenPublic } from "@/api/model";

/**
 * Centralized filter/search definitions for the specimens table.
 * This file keeps filter field names, option configs, and row-matching logic
 * in one place so `index.tsx` stays focused on UI wiring and layout.
 */
export type SpecimenRow = SpecimenPublic & { uploader_name?: string };

/** Shape returned by the backend facet-options endpoint. */
export type SpecimenFilterOptionsResponse = {
  assembly_types: string[];
  practices: string[];
  joinery_types: string[];
  sub_joinery_types: string[];
  loading_types: string[];
  uploader: string[];
};

export type FacetField = keyof SpecimenFilterOptionsResponse;

export type CheckboxField = FacetField | "connector" | "dowel";

export type SliderField =
  | "replicate_tests"
  | "fastener_numbers"
  | "e_yield_force"
  | "e_max_force"
  | "e_yield_displacement"
  | "e_max_displacement"
  | "e_ultimate_force"
  | "e_ultimate_displacement"
  | "e_stiffness"
  | "e_ductility";

export type SelectedFilters = Record<CheckboxField, string[]>;
export type SliderValuesByField = Record<string, [number, number]>;
export type CommandToken = { field: string; value: string };

/** Reused display options for boolean-style checkbox filters. */
const BOOLEAN_FILTER_OPTIONS = ["true", "false"];

/** Fields that are expected to come from backend-provided facets. */
const FACET_FIELDS: FacetField[] = [
  "assembly_types",
  "practices",
  "joinery_types",
  "sub_joinery_types",
  "loading_types",
  "uploader",
];

export const isFacetField = (field: CheckboxField): field is FacetField =>
  FACET_FIELDS.includes(field as FacetField);

/**
 * Checkbox filter definitions used by the sidebar and filter engine.
 * Each config says:
 * - which field key the UI/filtering uses
 * - how to label it in the sidebar
 * - how to read that value from a row for matching
 */
export const CHECKBOX_FILTER_CONFIG: Array<{
  field: CheckboxField;
  label: string;
  getValue: (row: SpecimenRow) => string;
  options?: string[];
}> = [
  {
    field: "assembly_types",
    label: "Assembly Type",
    getValue: (row) => row.assembly_type,
  },
  { field: "practices", label: "Practice", getValue: (row) => row.practice },
  {
    field: "joinery_types",
    label: "Joinery Type",
    getValue: (row) => row.joinery_type?.label ?? "",
  },
  {
    field: "sub_joinery_types",
    label: "Sub Joinery",
    getValue: (row) => row.sub_joinery_type?.label ?? "",
  },
  {
    field: "loading_types",
    label: "Loading Type",
    getValue: (row) => row.e_test_loading_type ?? "",
  },
  {
    field: "uploader",
    label: "Uploader",
    getValue: (row) => row.uploader_name ?? row.uploader_id,
  },
  {
    field: "connector",
    label: "Connector",
    getValue: (row) => (row.connector ? "true" : "false"),
    options: BOOLEAN_FILTER_OPTIONS,
  },
  {
    field: "dowel",
    label: "Dowel",
    getValue: (row) => (row.dowel ? "true" : "false"),
    options: BOOLEAN_FILTER_OPTIONS,
  },
];

export const CHECKBOX_FIELD_SET = new Set(
  CHECKBOX_FILTER_CONFIG.map((config) => config.field),
);

const normalizeValues = (values: string[]) =>
  [...values].map((value) => value.toLowerCase()).sort().join("\u0000");

/** Order-insensitive equality check for selected checkbox values by field. */
export const areSelectedFiltersEqual = (
  left: SelectedFilters,
  right: SelectedFilters,
) =>
  CHECKBOX_FILTER_CONFIG.every(
    (config) =>
      normalizeValues(left[config.field]) === normalizeValues(right[config.field]),
  );

export const SLIDER_FILTER_CONFIG: Array<{
  field: SliderField;
  label: string;
  getValue: (row: SpecimenRow) => number | null | undefined;
  step: number;
}> = [
  {
    field: "replicate_tests",
    label: "Replicate Tests",
    getValue: (row) => row.replicate_tests,
    step: 1,
  },
  {
    field: "fastener_numbers",
    label: "Fastener Count",
    getValue: (row) => row.fastener_numbers,
    step: 1,
  },
  {
    field: "e_yield_force",
    label: "Yield Force (kN)",
    getValue: (row) => row.e_yield_force,
    step: 1,
  },
  {
    field: "e_max_force",
    label: "Max Force (kN)",
    getValue: (row) => row.e_max_force,
    step: 1,
  },
  {
    field: "e_yield_displacement",
    label: "Yield Displacement (mm)",
    getValue: (row) => row.e_yield_displacement,
    step: 1,
  },
  {
    field: "e_max_displacement",
    label: "Max Displacement (mm)",
    getValue: (row) => row.e_max_displacement,
    step: 1,
  },
  {
    field: "e_ultimate_force",
    label: "Ultimate Force (kN)",
    getValue: (row) => row.e_ultimate_force,
    step: 1,
  },
  {
    field: "e_ultimate_displacement",
    label: "Ultimate Displacement (mm)",
    getValue: (row) => row.e_ultimate_displacement,
    step: 1,
  },
  {
    field: "e_stiffness",
    label: "Stiffness (kN/mm)",
    getValue: (row) => row.e_stiffness,
    step: 1,
  },
  {
    field: "e_ductility",
    label: "Ductility",
    getValue: (row) => row.e_ductility,
    step: 1,
  },
];

/** Creates a clean "nothing selected" checkbox state for all checkbox fields. */
export const createEmptySelectedFilters = (): SelectedFilters => ({
  assembly_types: [],
  practices: [],
  joinery_types: [],
  sub_joinery_types: [],
  loading_types: [],
  uploader: [],
  connector: [],
  dowel: [],
});

/**
 * Returns the searchable text value for a given row+field.
 * Used by command search (`field:value`) and free-text search.
 */
export const getSearchValue = (row: SpecimenRow, field: string) => {
  switch (field) {
    case "reference":
      return row.specimen_reference_id;
    case "assembly_types":
      return row.assembly_type;
    case "practices":
      return row.practice;
    case "joinery_types":
      return row.joinery_type?.label ?? "";
    case "sub_joinery_types":
      return row.sub_joinery_type?.label ?? "";
    case "loading_types":
      return row.e_test_loading_type ?? "";
    case "uploader":
      return row.uploader_name ?? row.uploader_id;
    case "connector":
      return row.connector ? "true" : "false";
    case "dowel":
      return row.dowel ? "true" : "false";
    default:
      return [
        row.specimen_reference_id,
        row.assembly_type,
        row.practice,
        row.joinery_type?.label ?? "",
        row.sub_joinery_type?.label ?? "",
        row.e_test_loading_type ?? "",
        row.uploader_name ?? row.uploader_id,
        row.connector ? "true" : "false",
        row.dowel ? "true" : "false",
      ].join(" ");
  }
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

interface FilterSpecimenRowsParams {
  rows: SpecimenRow[];
  searchTerm: string;
  searchField: string;
  commandTokens: CommandToken[];
  selectedFilters: SelectedFilters;
  sliderValuesByField: SliderValuesByField;
  sliderDefaults: Record<SliderField, [number, number]>;
}

/**
 * Main row-filtering function for specimens.
 * Applies:
 * 1) command/free-text search,
 * 2) checkbox selections,
 * 3) slider range constraints.
 */
export function filterSpecimenRows({
  rows,
  searchTerm,
  searchField,
  commandTokens,
  selectedFilters,
  sliderValuesByField,
  sliderDefaults,
}: FilterSpecimenRowsParams) {
  const query = searchTerm.trim().toLowerCase();

  return rows.filter((row) => {
    const referenceText = row.specimen_reference_id.toLowerCase();
    const matchesQuery =
      commandTokens.length > 0
        ? commandTokens.every((token) => {
            const rowValue = getSearchValue(row, token.field).toLowerCase();
            const isCheckboxToken = CHECKBOX_FIELD_SET.has(
              token.field as CheckboxField,
            );
            return isCheckboxToken
              ? rowValue === token.value
              : rowValue.includes(token.value);
          })
        : query.length === 0
          ? true
          : getSearchValue(row, searchField).toLowerCase().includes(query) ||
            (searchField === "all" && referenceText.includes(query));

    const matchesCheckboxFilters = CHECKBOX_FILTER_CONFIG.every((config) => {
      const selected = selectedFilters[config.field];
      if (selected.length === 0) return true;
      return selected.includes(config.getValue(row));
    });

    const matchesSliderFilters = SLIDER_FILTER_CONFIG.every((config) => {
      const [min, max] =
        sliderValuesByField[config.field] ?? sliderDefaults[config.field];
      const value = config.getValue(row);
      return isFiniteNumber(value) ? value >= min && value <= max : true;
    });

    return matchesQuery && matchesCheckboxFilters && matchesSliderFilters;
  });
}
