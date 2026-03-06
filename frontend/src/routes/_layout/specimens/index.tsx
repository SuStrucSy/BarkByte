import {
  specimensReadSpecimens,
} from "@/api/endpoints/specimens/specimens.gen";
import { useUsersReadUsers } from "@/api/endpoints/users/users.gen";
import { customInstance } from "@/api/mutator/custom-instance";
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
  type CommandToken,
  filterSpecimenRows,
  isFacetField,
  type CheckboxField,
  type SelectedFilters,
  SLIDER_FILTER_CONFIG,
  type SliderField,
  type SliderValuesByField,
  type SpecimenFilterOptionsResponse,
  type SpecimenRow,
} from "@/components/Data-Table/specimenTableFilters";
import { useSpecimenSearchFilterSync } from "@/components/Data-Table/useSpecimenSearchFilterSync";
import { DataTableToolbar } from "@/components/Data-Table/DataTableToolbar";
import {
  createColumns,
} from "@/components/Data-Table/specimenColumns";
import PendingSpecimens from "@/components/Pending/PendingSpecimens";
import { useNavigate } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import {
  getCoreRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import z from "zod/v4";

const specimensSearchSchema = z.object({
  page: z.number().catch(1),
});

const TABLE_PANEL_HEIGHT = "h-[calc(100vh-11rem)]";
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;
type Bounds = { min: number; max: number };

export const Route = createFileRoute("/_layout/specimens/")({
  staticData: {
    title: "Specimens",
  },
  component: Specimens,
  validateSearch: (search) => specimensSearchSchema.parse(search),
});

/**
 * Fetches users and builds a lookup map from uploader ID -> display name.
 * Display name fallback order is full name, then email, then raw user ID.
 */
function useUploaderNameMap() {
  const { data } = useUsersReadUsers({
    skip: 0,
    limit: 1000,
  });

  // Build a stable uploader ID -> display name map from user records.
  return useMemo(() => {
    const entries = (data?.data ?? []).map((user) => [
      user.id,
      user.full_name || user.email || user.id,
    ]);
    return Object.fromEntries(entries) as Record<string, string>;
  }, [data?.data]);
}

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

/**
 * Fetches predefined facet option lists used by checkbox filters.
 */
function useSpecimenFilterOptions() {
  return useQuery({
    queryKey: ["specimens", "filter-options"],
    queryFn: () =>
      customInstance<SpecimenFilterOptionsResponse>({
        url: "/api/v1/specimens/filter-options",
        method: "GET",
      }),
    staleTime: 5 * 60_000,
  });
}

function SpecimensKitTable() {
  
  const navigate = useNavigate({ from: Route.fullPath });
  const uploaderNameMap = useUploaderNameMap();

  // Controls whether the right-side filter sidebar is visible.
  const [controlsOpen, setControlsOpen] = useState(true);
  // Free-text / command input used in the top search bar.
  const [searchTerm, setSearchTerm] = useState("");
  // Active search mode (all fields or a specific field).
  const [searchField, setSearchField] = useState<string>("all");
  // Checkbox filter selections keyed by filter field.
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>(createEmptySelectedFilters);
  // Slider range selections keyed by slider field.
  const [sliderValuesByField, setSliderValuesByField] = useState<SliderValuesByField>({});
  // Client-side pagination state for the filtered table.
  const [pagination, setPagination] = useState<PaginationState>({pageIndex: 0,pageSize: 20});

  // Memoized table column definitions.
  const kitColumns = useMemo<ColumnDef<SpecimenPublic>[]>(
    () => createColumns<SpecimenPublic>(),
    [],
  );

  const { data, isLoading } = useAllSpecimens();
  const { data: filterOptionsData } = useSpecimenFilterOptions();

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

  // Seeds slider state from computed defaults, while preserving any existing user-adjusted values.
  useEffect(() => {
    setSliderValuesByField((prev) => ({
      ...sliderDefaults,
      ...prev,
    }));
  }, [sliderDefaults]);

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
  const commandTokens = useMemo(() => {
    if (!(searchField === "all" && searchTerm.includes(":"))) return [];

    return searchTerm
      .split(",")
      .map((segment) => segment.trim())
      .filter(Boolean)
      .map((segment) => {
        const firstColon = segment.indexOf(":");
        if (firstColon === -1) return null;

        const field = segment.slice(0, firstColon).trim().toLowerCase();
        const tokenValue = segment.slice(firstColon + 1).trim().toLowerCase();
        if (!field || !tokenValue) return null;
        if (!(field in fieldOptions)) return null;

        return { field, value: tokenValue };
      })
      .filter((token): token is CommandToken => token !== null);
  }, [searchField, searchTerm, fieldOptions]);

  // Keeps command-search text and sidebar checkbox selections synchronized both ways.
  useSpecimenSearchFilterSync({
    searchField,
    searchTerm,
    commandTokens,
    checkboxOptionsByField,
    selectedFilters,
    setSelectedFilters,
    setSearchTerm,
  });

  // Resets back to page 1 whenever any search/filter criteria changes.
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [
    searchTerm,
    searchField,
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
        searchField,
        commandTokens,
        selectedFilters,
        sliderValuesByField,
        sliderDefaults,
      }),
    [
      rows,
      searchTerm,
      searchField,
      commandTokens,
      selectedFilters,
      sliderValuesByField,
      sliderDefaults,
    ],
  );

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    searchField !== "all" ||
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
    setSelectedFilters((prev) => {
      const selected = prev[field];
      const nextSelected = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value];

      return {
        ...prev,
        [field]: nextSelected,
      };
    });
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSearchField("all");
    setSelectedFilters(createEmptySelectedFilters());
    setSliderValuesByField(sliderDefaults);
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

      setSearchTerm((prev) => {
        if (!prev.includes(":")) return prev;

        const nextSegments = prev
          .split(",")
          .map((segment) => segment.trim())
          .filter(Boolean)
          .filter((segment) => {
            const firstColon = segment.indexOf(":");
            if (firstColon === -1) return true;
            const segmentField = segment.slice(0, firstColon).trim().toLowerCase();
            return segmentField !== field.toLowerCase();
          });

        return nextSegments.join(", ");
      });
    }
    if (field in sliderDefaults) {
      setSliderValuesByField((prev) => ({
        ...prev,
        [field]: sliderDefaults[field as keyof typeof sliderDefaults],
      }));
    }
  };

  const table = useReactTable({
    data: filteredRows,
    columns: kitColumns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) {
    return <PendingSpecimens />;
  }

  return (
    <div className="flex w-full min-h-0 flex-col gap-3 sm:flex-row">
      <div className={`flex w-full min-h-0 flex-1 flex-col gap-4 overflow-hidden ${TABLE_PANEL_HEIGHT}`}>
        {/* Quick search bar: users type plain text or field:value commands to narrow results. */}
        <DataTableFilterCommand
          value={searchTerm}
          onValueChange={setSearchTerm}
          searchField={searchField}
          onSearchFieldChange={setSearchField}
          fieldOptions={fieldOptions}
        />
        {/* Control strip above the table: shows counts and gives users reset/toggle actions. */}
        <DataTableToolbar
          table={table}
          totalRows={rows.length}
          filteredRows={filteredRows.length}
          controlsOpen={controlsOpen}
          onToggleControls={() => setControlsOpen((prev) => !prev)}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={clearAllFilters}
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
        fields={filterFields}
        selectedByField={selectedFilters}
        sliderValuesByField={sliderValuesByField}
        onToggleOption={handleToggleOption}
        onSliderChange={(field, value) => {
          setSliderValuesByField((prev) => ({ ...prev, [field]: value }));
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
