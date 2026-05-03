import type {
	PaginationState,
	SortingState,
	VisibilityState,
} from "@tanstack/react-table";
import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { getInitialColumnVisibility } from "@/components/Data-Table/specimenColumns";
import {
	type CheckboxField,
	createEmptySelectedFilters,
	type FailureModeFilterMode,
	parseStructuredFilterQuery,
	type SelectedFilters,
	SLIDER_FILTER_CONFIG,
	type SliderField,
	type SliderValuesByField,
	serializeStructuredFilterQuery,
	slugifyFilterValue,
} from "@/components/Data-Table/specimenTableFilters";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const WIDE_TABLE_LAYOUT_MEDIA_QUERY = "(min-width: 1280px)";
const DEFAULT_PAGE_SIZE = 20;

type RelevantSearchState = {
	q?: string;
} & Partial<Record<SliderField, string | undefined>>;

export type SpecimensSearchUpdate = RelevantSearchState | {};

type SpecimensSearchState = {
	q: string;
} & Partial<Record<SliderField, string | undefined>>;

interface UseSpecimensControllerArgs {
	search: SpecimensSearchState;
	sliderDefaults: Record<SliderField, [number, number]>;
	replaceSearch: (search: SpecimensSearchUpdate) => void;
}

const getInitialQuerySearchTerm = (fallback: string) => {
	if (typeof window === "undefined") {
		return fallback;
	}

	return new URLSearchParams(window.location.search).get("q") ?? fallback;
};

const parseSliderParam = (value?: string): [number, number] | undefined => {
	if (!value) return undefined;

	const [rawMin, rawMax] = value.split("-");
	const min = Number(rawMin);
	const max = Number(rawMax);

	if (!Number.isFinite(min) || !Number.isFinite(max)) return undefined;
	return [min, max];
};

const serializeSliderParam = (value?: [number, number]) => {
	if (!value) return undefined;
	return `${value[0]}-${value[1]}`;
};

const getRelevantSearchState = (search: SpecimensSearchState) =>
	({
		q: search.q.trim().length > 0 ? search.q : undefined,
		...Object.fromEntries(
			SLIDER_FILTER_CONFIG.map((config) => [
				config.field,
				search[config.field],
			]),
		),
	}) satisfies RelevantSearchState;

const areRelevantSearchStatesEqual = (
	left: RelevantSearchState,
	right: RelevantSearchState,
) =>
	left.q === right.q &&
	SLIDER_FILTER_CONFIG.every(
		(config) => left[config.field] === right[config.field],
	);

const areRangeValuesEqual = (
	left?: [number, number],
	right?: [number, number],
) => !!left && !!right && left[0] === right[0] && left[1] === right[1];

const areSliderMapsEqual = (
	left: SliderValuesByField,
	right: SliderValuesByField,
) =>
	SLIDER_FILTER_CONFIG.every((config) =>
		areRangeValuesEqual(left[config.field], right[config.field]),
	);

export function useSpecimensController({
	search,
	sliderDefaults,
	replaceSearch,
}: UseSpecimensControllerArgs) {
	const isWideTableLayout = useMediaQuery(WIDE_TABLE_LAYOUT_MEDIA_QUERY, true);
	const initialBrowserQuerySearchTerm = useRef(
		getInitialQuerySearchTerm(search.q),
	).current;
	const [controlsOpen, setControlsOpen] = useState(isWideTableLayout);
	const [searchTerm, setSearchTerm] = useState(initialBrowserQuerySearchTerm);
	const searchTermRef = useRef(initialBrowserQuerySearchTerm);
	const hasAppliedInitialBrowserQueryRef = useRef(false);
	const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>(
		createEmptySelectedFilters,
	);
	const [failureModeFilterMode, setFailureModeFilterMode] =
		useState<FailureModeFilterMode>("any");
	const [sliderValuesByField, setSliderValuesByField] =
		useState<SliderValuesByField>({});
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: DEFAULT_PAGE_SIZE,
	});
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
		() => getInitialColumnVisibility(),
	);

	useEffect(() => {
		setControlsOpen(isWideTableLayout);
	}, [isWideTableLayout]);

	const syncSearchState = useCallback(
		(overrides: Partial<RelevantSearchState>) => {
			const nextSearch = {
				...getRelevantSearchState(search),
				...overrides,
			} satisfies RelevantSearchState;

			if (
				areRelevantSearchStatesEqual(getRelevantSearchState(search), nextSearch)
			) {
				return;
			}

			replaceSearch(nextSearch);
		},
		[replaceSearch, search],
	);

	const setSearchTermAndSync: Dispatch<SetStateAction<string>> = useCallback(
		(updater) => {
			const currentValue = searchTermRef.current;
			const nextValue =
				typeof updater === "function" ? updater(currentValue) : updater;

			if (nextValue === currentValue && (search.q ?? "") === nextValue) {
				return;
			}

			searchTermRef.current = nextValue;
			setSearchTerm(nextValue);
			syncSearchState({
				q: nextValue.trim().length > 0 ? nextValue : undefined,
			});
		},
		[search.q, syncSearchState],
	);

	const updateCheckboxSearchClause = useCallback(
		(field: CheckboxField, values: string[], mode?: FailureModeFilterMode) => {
			setSearchTermAndSync((prev) => {
				const parsedClauses = parseStructuredFilterQuery(prev);
				const nextClauses = parsedClauses.filter(
					(clause) => clause.field !== field,
				);

				if (values.length === 0) {
					return serializeStructuredFilterQuery(nextClauses);
				}

				nextClauses.push({
					field,
					mode: field === "failure_modes" ? mode : undefined,
					values: values.map((value) => slugifyFilterValue(value)),
				});

				return serializeStructuredFilterQuery(nextClauses);
			});
		},
		[setSearchTermAndSync],
	);

	useEffect(() => {
		const shouldUseInitialBrowserQuery =
			!hasAppliedInitialBrowserQueryRef.current &&
			search.q.length === 0 &&
			initialBrowserQuerySearchTerm.length > 0;
		const nextHydratedSearchTerm = shouldUseInitialBrowserQuery
			? initialBrowserQuerySearchTerm
			: search.q;

		searchTermRef.current = nextHydratedSearchTerm;
		setSearchTerm((prev) =>
			prev === nextHydratedSearchTerm ? prev : nextHydratedSearchTerm,
		);

		if (shouldUseInitialBrowserQuery || search.q.length > 0) {
			hasAppliedInitialBrowserQueryRef.current = true;
		}
	}, [initialBrowserQuerySearchTerm, search.q]);

	useEffect(() => {
		const nextSliderValues = Object.fromEntries(
			SLIDER_FILTER_CONFIG.map((config) => {
				const parsedValue = parseSliderParam(search[config.field]);
				return [config.field, parsedValue ?? sliderDefaults[config.field]];
			}),
		) as Record<SliderField, [number, number]>;

		setSliderValuesByField((prev) =>
			areSliderMapsEqual(prev, nextSliderValues) ? prev : nextSliderValues,
		);
	}, [search, sliderDefaults]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: deps are triggers, not used in body
	useEffect(() => {
		setPagination((prev) =>
			prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 },
		);
	}, [searchTerm, selectedFilters, sliderValuesByField, sliderDefaults]);

	const hasActiveSidebarFilters =
		Object.entries(selectedFilters).some(([, values]) => values.length > 0) ||
		SLIDER_FILTER_CONFIG.some((config) => {
			const current = sliderValuesByField[config.field];
			const baseline = sliderDefaults[config.field];
			return (
				!!current && (current[0] !== baseline[0] || current[1] !== baseline[1])
			);
		});

	const toggleControls = () => {
		setControlsOpen((prev) => !prev);
	};

	const resetColumns = () => {
		setColumnVisibility(getInitialColumnVisibility());
	};

	const toggleFilter = useCallback(
		(field: CheckboxField, value: string) => {
			const selected = selectedFilters[field];
			const nextSelected = selected.includes(value)
				? selected.filter((item) => item !== value)
				: [...selected, value];

			setSelectedFilters((prev) => ({
				...prev,
				[field]: nextSelected,
			}));
			updateCheckboxSearchClause(
				field,
				nextSelected,
				field === "failure_modes" ? failureModeFilterMode : undefined,
			);
		},
		[failureModeFilterMode, selectedFilters, updateCheckboxSearchClause],
	);

	const clearAllFilters = useCallback(() => {
		setSearchTermAndSync("");
		setSelectedFilters(createEmptySelectedFilters());
		setFailureModeFilterMode("any");
		setSliderValuesByField(sliderDefaults);
		replaceSearch({});
	}, [replaceSearch, setSearchTermAndSync, sliderDefaults]);

	const handleToggleOption = useCallback(
		(field: string, option: string) => {
			if (field in selectedFilters) {
				toggleFilter(field as CheckboxField, option);
			}
		},
		[selectedFilters, toggleFilter],
	);

	const handleResetField = useCallback(
		(field: string) => {
			if (field in selectedFilters) {
				setSelectedFilters((prev) => ({
					...prev,
					[field]: [],
				}));
				if (field === "failure_modes") {
					setFailureModeFilterMode("any");
				}

				updateCheckboxSearchClause(field as CheckboxField, []);
			}
			if (field in sliderDefaults) {
				setSliderValuesByField((prev) => ({
					...prev,
					[field]: sliderDefaults[field as SliderField],
				}));
				syncSearchState({ [field]: undefined });
			}
		},
		[
			selectedFilters,
			sliderDefaults,
			syncSearchState,
			updateCheckboxSearchClause,
		],
	);

	const handleSliderChange = useCallback(
		(field: string, value: [number, number]) => {
			setSliderValuesByField((prev) => ({ ...prev, [field]: value }));
			syncSearchState({
				[field]:
					value[0] !== sliderDefaults[field as SliderField][0] ||
					value[1] !== sliderDefaults[field as SliderField][1]
						? serializeSliderParam(value)
						: undefined,
			});
		},
		[sliderDefaults, syncSearchState],
	);

	const handleFailureModeFilterModeChange = useCallback(
		(mode: FailureModeFilterMode) => {
			setFailureModeFilterMode(mode);
			if (selectedFilters.failure_modes.length > 0) {
				updateCheckboxSearchClause(
					"failure_modes",
					selectedFilters.failure_modes,
					mode,
				);
			}
		},
		[selectedFilters.failure_modes, updateCheckboxSearchClause],
	);

	const handleFailureModeClick = useCallback(
		(failureMode: string) => {
			setSearchTermAndSync((prev) => {
				const parsedClauses = parseStructuredFilterQuery(prev);
				const nonCheckboxClauses = parsedClauses.filter(
					(clause) => clause.field !== "failure_modes",
				);
				const currentFailureModes =
					parsedClauses.find((clause) => clause.field === "failure_modes")
						?.values ?? [];
				const sluggedFailureMode = slugifyFilterValue(failureMode);
				const nextFailureModes = currentFailureModes.includes(
					sluggedFailureMode,
				)
					? currentFailureModes.filter((value) => value !== sluggedFailureMode)
					: [...currentFailureModes, sluggedFailureMode];

				if (nextFailureModes.length === 0) {
					return serializeStructuredFilterQuery(nonCheckboxClauses);
				}

				return serializeStructuredFilterQuery([
					...nonCheckboxClauses,
					{
						field: "failure_modes",
						mode: failureModeFilterMode,
						values: nextFailureModes,
					},
				]);
			});
			setControlsOpen(true);
		},
		[failureModeFilterMode, setSearchTermAndSync],
	);

	return {
		columnVisibility,
		clearAllFilters,
		controlsOpen,
		failureModeFilterMode,
		handleFailureModeClick,
		handleFailureModeFilterModeChange,
		handleResetField,
		handleSliderChange,
		handleToggleOption,
		hasActiveSidebarFilters,
		pagination,
		resetColumns,
		searchTerm,
		selectedFilters,
		setColumnVisibility,
		setFailureModeFilterMode,
		setPagination,
		setSelectedFilters,
		setSorting,
		setSearchTermAndSync,
		sliderValuesByField,
		sorting,
		toggleControls,
	};
}
