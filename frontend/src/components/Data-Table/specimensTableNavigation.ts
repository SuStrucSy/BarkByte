import {
	SLIDER_FILTER_CONFIG,
	type SliderField,
} from "@/components/Data-Table/specimenTableFilters";

const SPECIMENS_TABLE_SEARCH_STORAGE_KEY = "barkbyte:specimens-table-search";
const MAX_STORED_SEARCH_AGE_MS = 24 * 60 * 60 * 1000;

export type SpecimensTableSavedSearch = {
	q?: string;
} & Partial<Record<SliderField, string | undefined>>;

type StoredSpecimensTableSearch = {
	search: SpecimensTableSavedSearch;
	savedAt: number;
};

const isStorageAvailable = () => typeof window !== "undefined";

export function saveSpecimensTableSearch(search: SpecimensTableSavedSearch) {
	if (!isStorageAvailable()) return;

	const trimmedSearch = {
		q: search.q?.trim() ? search.q : undefined,
		...Object.fromEntries(
			SLIDER_FILTER_CONFIG.map((config) => [
				config.field,
				search[config.field],
			]),
		),
	} satisfies SpecimensTableSavedSearch;

	const storedSearch: StoredSpecimensTableSearch = {
		search: trimmedSearch,
		savedAt: Date.now(),
	};

	try {
		window.localStorage.setItem(
			SPECIMENS_TABLE_SEARCH_STORAGE_KEY,
			JSON.stringify(storedSearch),
		);
	} catch {
		// Storage can be unavailable in private browsing or locked-down contexts.
	}
}

export function readSpecimensTableSearch(): SpecimensTableSavedSearch {
	if (!isStorageAvailable()) return {};

	try {
		const rawValue = window.localStorage.getItem(
			SPECIMENS_TABLE_SEARCH_STORAGE_KEY,
		);
		if (!rawValue) return {};

		const storedSearch = JSON.parse(rawValue) as StoredSpecimensTableSearch;
		if (Date.now() - storedSearch.savedAt > MAX_STORED_SEARCH_AGE_MS) {
			window.localStorage.removeItem(SPECIMENS_TABLE_SEARCH_STORAGE_KEY);
			return {};
		}

		return storedSearch.search ?? {};
	} catch {
		window.localStorage.removeItem(SPECIMENS_TABLE_SEARCH_STORAGE_KEY);
		return {};
	}
}
