import {
  specimensReadSpecimens,
  useSpecimensReadSpecimenFilterOptions,
} from "@/api/endpoints/specimens/specimens.gen";
import { useUsersReadUsers } from "@/api/endpoints/users/users.gen";
import type { SpecimenPublic } from "@/api/model";
import { DataTableFilterCommand } from "@/components/Data-Table/DataTableFilterCommand";
import {
  type DataTableFilterField,
} from "@/components/Data-Table/DataTableFilterControls";
import { DataTablePagination } from "@/components/Data-Table/DataTablePagination";
import { SpecimenTableSideBar } from "@/components/Data-Table/SpecimenTableSideBar";
import { SpecimensResultsTable } from "@/components/Data-Table/SpecimensResultsTable";
import {
  CHECKBOX_FILTER_CONFIG,
  createEmptySelectedFilters,
  filterSpecimenRows,
  isFacetField,
  parseStructuredFilterQuery,
  serializeStructuredFilterQuery,
  slugifyFilterValue,
  type CheckboxField,
  type FailureModeFilterMode,
  type SelectedFilters,
  SLIDER_FILTER_CONFIG,
  type SliderField,
  type SliderValuesByField,
  type SpecimenRow,
} from "@/components/Data-Table/specimenTableFilters";
import { useSpecimenSearchFilterSync } from "@/components/Data-Table/useSpecimenSearchFilterSync";
import { DataTableToolbar } from "@/components/Data-Table/DataTableToolbar";
import {
  createColumns,
  getInitialColumnVisibility,
} from "@/components/Data-Table/specimenColumns";
import SkeletonSpecimensTable from "@/components/Skeleton/SkeletonSpecimensTable";
import { useNavigate } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type PaginationState,
  type SortingState,
  type VisibilityState,
  useReactTable,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import z from "zod/v4";

const sliderSearchSchemaFields = Object.fromEntries(
  SLIDER_FILTER_CONFIG.map((config) => [config.field, z.string().optional()]),
) as Record<SliderField, z.ZodOptional<z.ZodString>>;

const specimensSearchSchema = z.object({
  q: z.string().catch(""),
  ...sliderSearchSchemaFields,
});

const TABLE_PANEL_HEIGHT = "h-[calc(100vh-11rem)]";
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;
type Bounds = { min: number; max: number };
const DEFAULT_PAGE_SIZE = 20;

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

type RelevantSearchState = {
  q?: string;
} & Partial<Record<SliderField, string | undefined>>;

const getRelevantSearchState = (
  search: z.infer<typeof specimensSearchSchema>,
) =>
  ({
    q: search.q.trim().length > 0 ? search.q : undefined,
    ...Object.fromEntries(
      SLIDER_FILTER_CONFIG.map((config) => [config.field, search[config.field]]),
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

export const Route = createFileRoute("/_layout/specimens/")({
  staticData: {
    title: "Specimens",
  },
  component: Specimens,
  validateSearch: (search) => specimensSearchSchema.parse(search),
});

/**
 * Fetches every specimen by repeatedly requesting paginated batches
 * and returns one combined list with a total count.
 */
function useAllSpecimens() {
  // Gets the full specimens dataset (batched requests) for client-side filtering.
  return useQuery({
    queryKey: ["specimens", "all"],
    queryFn: async () => {
      const pageSize = 500;
      let skip = 0;
      let total = 0;
      let allRows: SpecimenPublic[] = [];

      do {
        const response = await specimensReadSpecimens({
          skip,
          limit: pageSize,
        });
        total = response.count;
        allRows = allRows.concat(response.data);
        skip += pageSize;
      } while (allRows.length < total);

      return {
        count: total,
        data: allRows,
      };
    },
    staleTime: 30_000,
  });
}

function useUploaderNameMap() {
  const { data } = useUsersReadUsers({
    skip: 0,
    limit: 1000,
  });

  return useMemo(() => {
    const entries = (data?.data ?? []).map((user) => [
      user.id,
      user.full_name || user.email || user.id,
    ]);
    return Object.fromEntries(entries) as Record<string, string>;
  }, [data?.data]);
}

function SpecimensKitTable() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const uploaderNameMap = useUploaderNameMap();
  const initialBrowserQuerySearchTerm = useRef(
    getInitialQuerySearchTerm(search.q),
  ).current;

  // Controls whether the right-side filter sidebar is visible.
  const [controlsOpen, setControlsOpen] = useState(true);
  // Free-text / command input used in the top search bar.
  const [searchTerm, setSearchTerm] = useState(initialBrowserQuerySearchTerm);
  const searchTermRef = useRef(initialBrowserQuerySearchTerm);
  const hasAppliedInitialBrowserQueryRef = useRef(false);
  // Checkbox filter selections keyed by filter field.
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>(createEmptySelectedFilters);
  const [failureModeFilterMode, setFailureModeFilterMode] =
    useState<FailureModeFilterMode>("any");
  // Slider range selections keyed by slider field.
  const [sliderValuesByField, setSliderValuesByField] = useState<SliderValuesByField>({});
  // Client-side pagination state for the filtered table.
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  // Default visible/hidden columns on first render. Users can still change this from Toggle Columns.
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() =>
    getInitialColumnVisibility(),
  );

  function syncSearchState(overrides: Partial<RelevantSearchState>) {
    const nextSearch = {
      ...getRelevantSearchState(search),
      ...overrides,
    } satisfies RelevantSearchState;

    if (areRelevantSearchStatesEqual(getRelevantSearchState(search), nextSearch)) {
      return;
    }

    navigate({
      replace: true,
      search: nextSearch,
    });
  }

  const setSearchTermAndSync: Dispatch<SetStateAction<string>> = (updater) => {
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
  };

  const updateCheckboxSearchClause = (
    field: CheckboxField,
    values: string[],
    mode?: FailureModeFilterMode,
  ) => {
    setSearchTermAndSync((prev) => {
      const parsedClauses = parseStructuredFilterQuery(prev);
      const nextClauses = parsedClauses.filter((clause) => clause.field !== field);

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
  };

  // Memoized table column definitions.
  const kitColumns = useMemo<ColumnDef<SpecimenPublic>[]>(
    () =>
      createColumns<SpecimenPublic>({
        onFailureModeClick: (failureMode) => {
          setSearchTermAndSync((prev) => {
            const parsedClauses = parseStructuredFilterQuery(prev);
            const nonCheckboxClauses = parsedClauses.filter(
              (clause) => clause.field !== "failure_modes",
            );
            const currentFailureModes =
              parsedClauses
                .find((clause) => clause.field === "failure_modes")
                ?.values ?? [];
            const sluggedFailureMode = slugifyFilterValue(failureMode);
            const nextFailureModes = currentFailureModes.includes(sluggedFailureMode)
              ? currentFailureModes
              : [...currentFailureModes, sluggedFailureMode];

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
      }),
    [failureModeFilterMode, setSearchTermAndSync],
  );

  const { data, isLoading } = useAllSpecimens();
  const { data: filterOptionsData } = useSpecimensReadSpecimenFilterOptions();

  // Normalize row data by attaching uploader display names.
  const rows = useMemo<SpecimenRow[]>(
    () =>
      (data?.data ?? []).map((row) => ({
        ...row,
        uploader_name: uploaderNameMap[row.uploader_id] ?? row.uploader_id,
      })),
    [data?.data, uploaderNameMap],
  );

  // Unique reference IDs used as options in command search.
  const referenceOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((row) => row.specimen_reference_id)))
        .filter(Boolean)
        .sort(),
    [rows],
  );

  // Build checkbox options per filter field from facet payload/static options.
  const checkboxOptionsByField = useMemo(() => {
    const entries = CHECKBOX_FILTER_CONFIG.map((config) => {
      if (config.options) {
        return [config.field, config.options] as const;
      }

      if (isFacetField(config.field)) {
        const facetOptions = (filterOptionsData?.[config.field] ?? [])
          .filter(isNonEmptyString)
          .slice()
          .sort();
        return [config.field, facetOptions] as const;
      }

      return [config.field, []] as const;
    });

    return Object.fromEntries(entries) as Record<CheckboxField, string[]>;
  }, [filterOptionsData]);

  // All searchable command fields plus reference values.
  const fieldOptions = useMemo(
    () => ({
      reference: referenceOptions,
      ...checkboxOptionsByField,
    }),
    [referenceOptions, checkboxOptionsByField],
  );

  const getBounds = (values: Array<number | null | undefined>) => {
    const nums = values.filter(
      (value): value is number =>
        typeof value === "number" && Number.isFinite(value),
    );
    if (!nums.length) return { min: 0, max: 0 };
    return { min: Math.min(...nums), max: Math.max(...nums) };
  };

  // Compute min/max bounds for each slider field from current rows.
  const sliderBoundsByField = useMemo(() => {
    const entries = SLIDER_FILTER_CONFIG.map((config) => [
      config.field,
      getBounds(rows.map((row) => config.getValue(row))),
    ]);
    return Object.fromEntries(entries) as Record<SliderField, Bounds>;
  }, [rows]);

  // Default slider ranges initialized from computed bounds.
  const sliderDefaults = useMemo(
    () =>
      Object.fromEntries(
        SLIDER_FILTER_CONFIG.map((config) => {
          const bounds = sliderBoundsByField[config.field];
          return [config.field, [bounds.min, bounds.max] as [number, number]];
        }),
      ) as Record<SliderField, [number, number]>,
    [sliderBoundsByField],
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
  }, [
    search.e_ductility,
    search.e_max_displacement,
    search.e_max_force,
    search.e_stiffness,
    search.e_ultimate_displacement,
    search.e_ultimate_force,
    search.e_yield_displacement,
    search.e_yield_force,
    search.fastener_numbers,
    search.replicate_tests,
    sliderDefaults,
  ]);

  // Convert filter config + bounds/options into UI-ready filter field definitions.
  const filterFields = useMemo<DataTableFilterField[]>(
    () => [
      ...CHECKBOX_FILTER_CONFIG.map((config) => ({
        type: "checkbox" as const,
        value: config.field,
        label: config.label,
        options: checkboxOptionsByField[config.field],
      })),
      ...SLIDER_FILTER_CONFIG.map((config) => {
        const bounds = sliderBoundsByField[config.field];
        return {
          type: "slider" as const,
          value: config.field,
          label: config.label,
          min: bounds.min,
          max: bounds.max,
          step: config.step,
        };
      }),
    ],
    [checkboxOptionsByField, sliderBoundsByField],
  );

  // Parse command-style tokens from search text, e.g. "field:value".
  const structuredFilters = useMemo(() => {
    if (!searchTerm.includes(":")) return [];
    return parseStructuredFilterQuery(searchTerm).filter(
      (clause) => clause.field in fieldOptions,
    );
  }, [searchTerm, fieldOptions]);

  // Hydrates sidebar checkbox state from the current command-search text.
  useSpecimenSearchFilterSync({
    searchField: "all",
    searchTerm,
    structuredFilters,
    checkboxOptionsByField,
    setSelectedFilters,
    setFailureModeFilterMode,
  });

  // Resets back to page 1 whenever any search/filter criteria changes.
  useEffect(() => {
    setPagination((prev) =>
      prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 },
    );
  }, [
    searchTerm,
    selectedFilters,
    sliderValuesByField,
    sliderDefaults,
  ]);

  // Apply command/text search, checkbox filters, and slider ranges to produce visible rows.
  const filteredRows = useMemo(
    () =>
      filterSpecimenRows({
        rows,
        searchTerm,
        searchField: "all",
        structuredFilters,
        selectedFilters,
        failureModeFilterMode,
        sliderValuesByField,
        sliderDefaults,
      }),
    [
      rows,
      searchTerm,
      structuredFilters,
      selectedFilters,
      failureModeFilterMode,
      sliderValuesByField,
      sliderDefaults,
    ],
  );

  const hasActiveSidebarFilters =
    CHECKBOX_FILTER_CONFIG.some(
      (config) => selectedFilters[config.field].length > 0,
    ) ||
    SLIDER_FILTER_CONFIG.some((config) => {
      const current = sliderValuesByField[config.field];
      const baseline = sliderDefaults[config.field];
      return (
        !!current &&
        (current[0] !== baseline[0] || current[1] !== baseline[1])
      );
    });

  const toggleFilter = (field: CheckboxField, value: string) => {
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
  };

  const clearAllFilters = () => {
    setSearchTermAndSync("");
    setSelectedFilters(createEmptySelectedFilters());
    setFailureModeFilterMode("any");
    setSliderValuesByField(sliderDefaults);
    navigate({
      replace: true,
      search: {},
    });
  };

  const handleToggleOption = (field: string, option: string) => {
    if (field in selectedFilters) {
      toggleFilter(field as CheckboxField, option);
    }
  };

  const handleResetField = (field: string) => {
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
        [field]: sliderDefaults[field as keyof typeof sliderDefaults],
      }));
      syncSearchState({ [field]: undefined });
    }
  };

  const table = useReactTable({
    data: filteredRows,
    columns: kitColumns,
    state: { pagination, sorting, columnVisibility },
    onPaginationChange: (updater) => {
      setPagination(updater);
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) {
    return <SkeletonSpecimensTable />;
  }

  return (
    <div className="flex w-full min-h-0 flex-col gap-3 sm:flex-row">
      <div className={`flex w-full min-h-0 flex-1 flex-col gap-4 overflow-hidden ${TABLE_PANEL_HEIGHT}`}>
        {/* Quick search bar: users type plain text or field:value commands to narrow results. */}
        <DataTableFilterCommand
          value={searchTerm}
          onValueChange={(value) => {
            searchTermRef.current = value;
            setSearchTerm(value);
          }}
          onCommitValueChange={setSearchTermAndSync}
          searchField="all"
          onSearchFieldChange={() => {}}
          fieldOptions={fieldOptions}
        />
        {/* Control strip above the table: shows counts and gives users reset/toggle actions. */}
        <DataTableToolbar
          table={table}
          totalRows={rows.length}
          filteredRows={filteredRows.length}
          controlsOpen={controlsOpen}
          onToggleControls={() => setControlsOpen((prev) => !prev)}
        />

        {/* Main results grid: this is the actual list of specimens users can scan and click into. */}
        <SpecimensResultsTable
          table={table}
          columnCount={kitColumns.length}
          onRowClick={(row) =>
            navigate({
              to: "/specimens/$specimenId",
              params: { specimenId: row.original.id },
            })
          }
        />
        {/* Bottom pager: lets users move between pages and control how many rows are shown. */}
        <DataTablePagination table={table} pagination={pagination} />
      </div>

      <SpecimenTableSideBar
        controlsOpen={controlsOpen}
        panelHeightClassName={TABLE_PANEL_HEIGHT}
        onClearAll={clearAllFilters}
        hasActiveSidebarFilters={hasActiveSidebarFilters}
        fields={filterFields}
        selectedByField={selectedFilters}
        sliderValuesByField={sliderValuesByField}
        failureModeFilterMode={failureModeFilterMode}
        onToggleOption={handleToggleOption}
        onSliderChange={(field, value) => {
          setSliderValuesByField((prev) => ({ ...prev, [field]: value }));
          syncSearchState({
            [field]:
              value[0] !== sliderDefaults[field as SliderField][0] ||
              value[1] !== sliderDefaults[field as SliderField][1]
                ? serializeSliderParam(value)
                : undefined,
          });
        }}
        onFailureModeFilterModeChange={(mode) => {
          setFailureModeFilterMode(mode);
          if (selectedFilters.failure_modes.length > 0) {
            updateCheckboxSearchClause(
              "failure_modes",
              selectedFilters.failure_modes,
              mode,
            );
          }
        }}
        onResetField={handleResetField}
      />
    </div>
  );
}

function Specimens() {
  return (
    <div className="w-full min-h-0">
      <SpecimensKitTable />
    </div>
  );
}
