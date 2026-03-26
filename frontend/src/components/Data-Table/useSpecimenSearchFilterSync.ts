import { type Dispatch, type SetStateAction, useEffect } from "react";
import {
	areSelectedFiltersEqual,
	CHECKBOX_FIELD_SET,
	type CheckboxField,
	canonicalizeFilterValue,
	createEmptySelectedFilters,
	type FailureModeFilterMode,
	type SelectedFilters,
	type StructuredFilterClause,
} from "@/components/Data-Table/specimenTableFilters";

interface UseSpecimenSearchFilterSyncParams {
	searchField: string;
	searchTerm: string;
	structuredFilters: StructuredFilterClause[];
	checkboxOptionsByField: Record<CheckboxField, string[]>;
	setSelectedFilters: Dispatch<SetStateAction<SelectedFilters>>;
	setFailureModeFilterMode: Dispatch<SetStateAction<FailureModeFilterMode>>;
}

/**
 * Hydrates checkbox sidebar state from the current command-search text.
 *
 * The command/query string is the source of truth; this hook parses
 * structured `field:value` clauses and mirrors them into checkbox selections
 * plus the failure-mode matching mode shown in the sidebar.
 */
export function useSpecimenSearchFilterSync({
	searchField,
	searchTerm,
	structuredFilters,
	checkboxOptionsByField,
	setSelectedFilters,
	setFailureModeFilterMode,
}: UseSpecimenSearchFilterSyncParams) {
	// Sync command tokens (field:value) into checkbox selections.
	useEffect(() => {
		const nextSelected = createEmptySelectedFilters();

		if (!(searchField === "all" && searchTerm.includes(":"))) {
			setFailureModeFilterMode((prev) => (prev === "any" ? prev : "any"));
			setSelectedFilters((prev) =>
				areSelectedFiltersEqual(prev, nextSelected) ? prev : nextSelected,
			);
			return;
		}

		let hasCheckboxToken = false;
		let nextFailureModeFilterMode: FailureModeFilterMode = "any";

		for (const clause of structuredFilters) {
			if (!CHECKBOX_FIELD_SET.has(clause.field as CheckboxField)) continue;

			const field = clause.field as CheckboxField;
			if (field === "failure_modes" && clause.mode) {
				nextFailureModeFilterMode = clause.mode;
			}

			for (const clauseValue of clause.values) {
				const matchedOption = checkboxOptionsByField[field].find(
					(option) =>
						canonicalizeFilterValue(option) ===
						canonicalizeFilterValue(clauseValue),
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
			setFailureModeFilterMode((prev) => (prev === "any" ? prev : "any"));
			setSelectedFilters((prev) =>
				areSelectedFiltersEqual(prev, nextSelected) ? prev : nextSelected,
			);
			return;
		}

		setFailureModeFilterMode((prev) =>
			prev === nextFailureModeFilterMode ? prev : nextFailureModeFilterMode,
		);
		setSelectedFilters((prev) =>
			areSelectedFiltersEqual(prev, nextSelected) ? prev : nextSelected,
		);
	}, [
		structuredFilters,
		searchField,
		searchTerm,
		checkboxOptionsByField,
		setFailureModeFilterMode,
		setSelectedFilters,
	]);
}
