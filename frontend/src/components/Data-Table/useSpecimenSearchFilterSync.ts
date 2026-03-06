import {
  areSelectedFiltersEqual,
  CHECKBOX_FIELD_SET,
  type CheckboxField,
  type SelectedFilters,
  createEmptySelectedFilters,
} from "@/components/Data-Table/specimenTableFilters";
import { useEffect, type Dispatch, type SetStateAction } from "react";

type CommandToken = { field: string; value: string };

interface UseSpecimenSearchFilterSyncParams {
  searchField: string;
  searchTerm: string;
  commandTokens: CommandToken[];
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
  commandTokens,
  checkboxOptionsByField,
  selectedFilters,
  setSelectedFilters,
  setSearchTerm,
}: UseSpecimenSearchFilterSyncParams) {
  // Sync command tokens (field:value) into checkbox selections.
  useEffect(() => {
    if (!(searchField === "all" && searchTerm.includes(":"))) return;

    const nextSelected = createEmptySelectedFilters();
    let hasCheckboxToken = false;

    for (const token of commandTokens) {
      if (!CHECKBOX_FIELD_SET.has(token.field as CheckboxField)) continue;

      const field = token.field as CheckboxField;
      const matchedOption = checkboxOptionsByField[field].find(
        (option) => option.toLowerCase() === token.value,
      );
      const optionValue = matchedOption ?? token.value;

      if (
        !nextSelected[field].some(
          (current) => current.toLowerCase() === optionValue.toLowerCase(),
        )
      ) {
        nextSelected[field].push(optionValue);
      }
      hasCheckboxToken = true;
    }

    if (!hasCheckboxToken) return;
    setSelectedFilters((prev) =>
      areSelectedFiltersEqual(prev, nextSelected) ? prev : nextSelected,
    );
  }, [
    commandTokens,
    searchField,
    searchTerm,
    checkboxOptionsByField,
    setSelectedFilters,
  ]);

  // Sync checkbox selections back into command-search text.
  // Non-checkbox/free-text segments are preserved.
  useEffect(() => {
    setSearchTerm((prev) => {
      const nonCheckboxSegments = prev
        .split(",")
        .map((segment) => segment.trim())
        .filter(Boolean)
        .filter((segment) => {
          const firstColon = segment.indexOf(":");
          if (firstColon === -1) return true;
          const field = segment.slice(0, firstColon).trim().toLowerCase();
          return !CHECKBOX_FIELD_SET.has(field as CheckboxField);
        });

      const checkboxSegments = Object.entries(selectedFilters).flatMap(
        ([field, values]) =>
          values.map((value) => `${field}:${value}`),
      );

      const nextTerm = [...nonCheckboxSegments, ...checkboxSegments].join(", ");
      return nextTerm === prev ? prev : nextTerm;
    });
  }, [selectedFilters, setSearchTerm]);
}
