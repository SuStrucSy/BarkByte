import {
  areSelectedFiltersEqual,
  canonicalizeFilterValue,
  CHECKBOX_FIELD_SET,
  type CheckboxField,
  parseStructuredFilterQuery,
  type SelectedFilters,
  serializeStructuredFilterQuery,
  slugifyFilterValue,
  type StructuredFilterClause,
  createEmptySelectedFilters,
} from "@/components/Data-Table/specimenTableFilters";
import { useEffect, type Dispatch, type SetStateAction } from "react";

interface UseSpecimenSearchFilterSyncParams {
  searchField: string;
  searchTerm: string;
  structuredFilters: StructuredFilterClause[];
  checkboxOptionsByField: Record<CheckboxField, string[]>;
  selectedFilters: SelectedFilters;
  setSelectedFilters: Dispatch<SetStateAction<SelectedFilters>>;
  setSearchTerm: Dispatch<SetStateAction<string>>;
}

/**
 * Keeps command-search text and checkbox filter state synchronized both ways.
 *
 * Direction A: command tokens in `searchTerm` -> `selectedFilters`
 * Direction B: `selectedFilters` -> command tokens in `searchTerm`
 *
 * This ensures users can use either the command input or sidebar checkboxes
 * and still see consistent filtering state in both UIs.
 */
export function useSpecimenSearchFilterSync({
  searchField,
  searchTerm,
  structuredFilters,
  checkboxOptionsByField,
  selectedFilters,
  setSelectedFilters,
  setSearchTerm,
}: UseSpecimenSearchFilterSyncParams) {
  // Sync command tokens (field:value) into checkbox selections.
  useEffect(() => {
    const nextSelected = createEmptySelectedFilters();

    if (!(searchField === "all" && searchTerm.includes(":"))) {
      setSelectedFilters((prev) =>
        areSelectedFiltersEqual(prev, nextSelected) ? prev : nextSelected,
      );
      return;
    }

    let hasCheckboxToken = false;

    for (const clause of structuredFilters) {
      if (!CHECKBOX_FIELD_SET.has(clause.field as CheckboxField)) continue;

      const field = clause.field as CheckboxField;

      for (const clauseValue of clause.values) {
        const matchedOption = checkboxOptionsByField[field].find(
          (option) => canonicalizeFilterValue(option) === canonicalizeFilterValue(clauseValue),
        );
        const optionValue = matchedOption ?? clauseValue;

        if (
          !nextSelected[field].some(
            (current) =>
              canonicalizeFilterValue(current) ===
              canonicalizeFilterValue(optionValue),
          )
        ) {
          nextSelected[field].push(optionValue);
        }
      }
      hasCheckboxToken = true;
    }

    if (!hasCheckboxToken) {
      setSelectedFilters((prev) =>
        areSelectedFiltersEqual(prev, nextSelected) ? prev : nextSelected,
      );
      return;
    }

    setSelectedFilters((prev) =>
      areSelectedFiltersEqual(prev, nextSelected) ? prev : nextSelected,
    );
  }, [
    structuredFilters,
    searchField,
    searchTerm,
    checkboxOptionsByField,
    setSelectedFilters,
  ]);

  // Sync checkbox selections back into command-search text.
  // Non-checkbox/free-text segments are preserved.
  useEffect(() => {
    setSearchTerm((prev) => {
      const segments = prev
        .split(";")
        .map((segment) => segment.trim())
        .filter(Boolean);
      const trailingSegment = segments.at(-1) ?? "";
      const parsedTrailingClauses = parseStructuredFilterQuery(trailingSegment);
      const hasIncompleteTrailingSegment =
        trailingSegment.length > 0 &&
        (parsedTrailingClauses.length === 0 ||
          serializeStructuredFilterQuery(parsedTrailingClauses) !==
            trailingSegment);

      const nonCheckboxClauses = parseStructuredFilterQuery(prev).filter(
        (clause) => !CHECKBOX_FIELD_SET.has(clause.field as CheckboxField),
      );

      const checkboxClauses = Object.entries(selectedFilters).flatMap(
        ([field, values]) =>
          values.length === 0
            ? []
            : [
                {
                  field,
                  values: values.map((value) => slugifyFilterValue(value)),
                } satisfies StructuredFilterClause,
              ],
      );

      const nextTerm = serializeStructuredFilterQuery([
        ...nonCheckboxClauses,
        ...checkboxClauses,
      ]);
      const nextValue = hasIncompleteTrailingSegment
        ? [nextTerm, trailingSegment].filter(Boolean).join(";")
        : nextTerm;
      return nextValue === prev ? prev : nextValue;
    });
  }, [selectedFilters, setSearchTerm]);
}
