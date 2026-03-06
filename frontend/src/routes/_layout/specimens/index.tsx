import {
  specimensReadSpecimens,
  useSpecimensReadSpecimens,
} from "@/api/endpoints/specimens/specimens.gen";
import { useUsersReadUsers } from "@/api/endpoints/users/users.gen";
import type { SpecimenPublic } from "@/api/model";
import { DataTableFilterCommand } from "@/components/Data-Table/DataTableFilterCommand";
import {
  DataTableFilterControls,
  type DataTableFilterField,
} from "@/components/Data-Table/DataTableFilterControls";
import { DataTablePagination } from "@/components/Data-Table/DataTablePagination";
import { DataTableToolbar } from "@/components/Data-Table/DataTableToolbar";
import { DataTable } from "@/components/Data-Table/DataTable";
import {
  createColumns,
  getInitialColumnVisibility,
} from "@/components/Data-Table/specimenColumns";
import PendingSpecimens from "@/components/Pending/PendingSpecimens";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import z from "zod/v4";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const specimensSearchSchema = z.object({
  page: z.number().catch(1),
});

const PER_PAGE = 20;
const TABLE_PANEL_HEIGHT = "h-[calc(100vh-11rem)]";
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;
const hasNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export const Route = createFileRoute("/_layout/specimens/")({
  staticData: {
    title: "Specimens",
  },
  component: Specimens,
  validateSearch: (search) => specimensSearchSchema.parse(search),
});

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

function useAllSpecimens() {
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

function SpecimensTable() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { page } = Route.useSearch();
  const columns = useMemo(() => createColumns<SpecimenPublic>(), []);
  const uploaderNameMap = useUploaderNameMap();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: page - 1,
    pageSize: PER_PAGE,
  });

  // Call the Orval-generated hook instead of useQuery
  const { data, isLoading, isPlaceholderData } = useSpecimensReadSpecimens(
    {
      skip: pagination.pageIndex * pagination.pageSize,
      limit: pagination.pageSize,
    },
    {
      query: {
        placeholderData: (prevData) => prevData,
      },
    },
  );

  const handlePaginationChange = (
    updater: PaginationState | ((old: PaginationState) => PaginationState),
  ) => {
    const newPagination =
      typeof updater === "function" ? updater(pagination) : updater;

    setPagination(newPagination);

    // Update URL search params
    navigate({
      search: (prev) => ({
        ...prev,
        page: newPagination.pageIndex + 1, // pageIndex 0 = page 1
      }),
    });
  };

  const count = data?.count ?? 0;
  const tableData = useMemo(
    () =>
      (data?.data ?? []).map((row) => ({
        ...row,
        uploader_name: uploaderNameMap[row.uploader_id] ?? row.uploader_id,
      })),
    [data?.data, uploaderNameMap],
  );

  if (isLoading && !isPlaceholderData) {
    return <PendingSpecimens />;
  }

  return (
    <DataTable<SpecimenPublic, unknown>
      columns={columns}
      initialColumnVisibility={getInitialColumnVisibility()}
      data={tableData as SpecimenPublic[]}
      isPlaceholderData={isPlaceholderData}
      onRowClick={(row) =>
        navigate({
          to: "/specimens/$specimenId",
          params: { specimenId: row.original.id },
        })
      }
      rowCount={count}
      pagination={pagination}
      setPagination={handlePaginationChange}
    />
  );
}

function SpecimensKitTable() {
  const navigate = useNavigate({ from: Route.fullPath });
  const uploaderNameMap = useUploaderNameMap();
  const [controlsOpen, setControlsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState<string>("all");
  const [assemblyFilters, setAssemblyFilters] = useState<string[]>([]);
  const [practiceFilters, setPracticeFilters] = useState<string[]>([]);
  const [joineryFilters, setJoineryFilters] = useState<string[]>([]);
  const [subJoineryFilters, setSubJoineryFilters] = useState<string[]>([]);
  const [loadingTypeFilters, setLoadingTypeFilters] = useState<string[]>([]);
  const [uploaderFilters, setUploaderFilters] = useState<string[]>([]);
  const [connectorFilters, setConnectorFilters] = useState<string[]>([]);
  const [dowelFilters, setDowelFilters] = useState<string[]>([]);
  const [sliderValuesByField, setSliderValuesByField] = useState<
    Record<string, [number, number]>
  >({});
  const [toggleAllSignal, setToggleAllSignal] = useState(0);
  const [toggleAllOpenState, setToggleAllOpenState] = useState(false);
  const [allControlsCollapsed, setAllControlsCollapsed] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const kitColumns = useMemo<ColumnDef<SpecimenPublic>[]>(
    () => createColumns<SpecimenPublic>(),
    [],
  );

  const { data, isLoading } = useAllSpecimens();

  const rows = useMemo(
    () =>
      (data?.data ?? []).map((row) => ({
        ...row,
        uploader_name: uploaderNameMap[row.uploader_id] ?? row.uploader_id,
      })),
    [data?.data, uploaderNameMap],
  );

  const assemblyOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((row) => row.assembly_type)))
        .filter(Boolean)
        .sort(),
    [rows],
  );

  const practiceOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((row) => row.practice)))
        .filter(Boolean)
        .sort(),
    [rows],
  );

  const referenceOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((row) => row.specimen_reference_id)))
        .filter(Boolean)
        .sort(),
    [rows],
  );

  const joineryOptions = useMemo(
    () =>
      Array.from(
        new Set(rows.map((row) => row.joinery_type?.label).filter(isNonEmptyString)),
      ).sort(),
    [rows],
  );

  const subJoineryOptions = useMemo(
    () =>
      Array.from(
        new Set(rows.map((row) => row.sub_joinery_type?.label).filter(isNonEmptyString)),
      ).sort(),
    [rows],
  );

  const loadingTypeOptions = useMemo(
    () =>
      Array.from(
        new Set(rows.map((row) => row.e_test_loading_type).filter(isNonEmptyString)),
      ).sort(),
    [rows],
  );

  const uploaderOptions = useMemo(
    () =>
      Array.from(
        new Set(
          rows
            .map((row) => (row as any).uploader_name as string | undefined)
            .filter(isNonEmptyString),
        ),
      ).sort(),
    [rows],
  );

  const fieldOptions = useMemo(
    () => ({
      reference: referenceOptions,
      assembly: assemblyOptions,
      practice: practiceOptions,
      joinery: joineryOptions,
      sub_joinery: subJoineryOptions,
      loading_type: loadingTypeOptions,
      uploader: uploaderOptions,
      connector: ["true", "false"],
      dowel: ["true", "false"],
    }),
    [
      referenceOptions,
      assemblyOptions,
      practiceOptions,
      joineryOptions,
      subJoineryOptions,
      loadingTypeOptions,
      uploaderOptions,
    ],
  );

  const getBounds = (values: Array<number | null | undefined>) => {
    const nums = values.filter(hasNumber);
    if (!nums.length) return { min: 0, max: 0 };
    return { min: Math.min(...nums), max: Math.max(...nums) };
  };

  const replicateBounds = useMemo(
    () => getBounds(rows.map((row) => row.replicate_tests)),
    [rows],
  );
  const fastenerBounds = useMemo(
    () => getBounds(rows.map((row) => row.fastener_numbers)),
    [rows],
  );
  const yieldForceBounds = useMemo(
    () => getBounds(rows.map((row) => row.e_yield_force)),
    [rows],
  );
  const maxForceBounds = useMemo(
    () => getBounds(rows.map((row) => row.e_max_force)),
    [rows],
  );
  const yieldDispBounds = useMemo(
    () => getBounds(rows.map((row) => row.e_yield_displacement)),
    [rows],
  );
  const maxDispBounds = useMemo(
    () => getBounds(rows.map((row) => row.e_max_displacement)),
    [rows],
  );
  const ultimateForceBounds = useMemo(
    () => getBounds(rows.map((row) => row.e_ultimate_force)),
    [rows],
  );
  const ultimateDispBounds = useMemo(
    () => getBounds(rows.map((row) => row.e_ultimate_displacement)),
    [rows],
  );
  const stiffnessBounds = useMemo(
    () => getBounds(rows.map((row) => row.e_stiffness)),
    [rows],
  );
  const ductilityBounds = useMemo(
    () => getBounds(rows.map((row) => row.e_ductility)),
    [rows],
  );

  const sliderDefaults = useMemo(
    () => ({
      replicate_tests: [replicateBounds.min, replicateBounds.max] as [number, number],
      fastener_numbers: [fastenerBounds.min, fastenerBounds.max] as [number, number],
      e_yield_force: [yieldForceBounds.min, yieldForceBounds.max] as [number, number],
      e_max_force: [maxForceBounds.min, maxForceBounds.max] as [number, number],
      e_yield_displacement: [yieldDispBounds.min, yieldDispBounds.max] as [number, number],
      e_max_displacement: [maxDispBounds.min, maxDispBounds.max] as [number, number],
      e_ultimate_force: [ultimateForceBounds.min, ultimateForceBounds.max] as [number, number],
      e_ultimate_displacement: [
        ultimateDispBounds.min,
        ultimateDispBounds.max,
      ] as [number, number],
      e_stiffness: [stiffnessBounds.min, stiffnessBounds.max] as [number, number],
      e_ductility: [ductilityBounds.min, ductilityBounds.max] as [number, number],
    }),
    [
      replicateBounds,
      fastenerBounds,
      yieldForceBounds,
      maxForceBounds,
      yieldDispBounds,
      maxDispBounds,
      ultimateForceBounds,
      ultimateDispBounds,
      stiffnessBounds,
      ductilityBounds,
    ],
  );

  useEffect(() => {
    setSliderValuesByField((prev) => ({
      ...sliderDefaults,
      ...prev,
    }));
  }, [sliderDefaults]);

  const filterFields = useMemo<DataTableFilterField[]>(
    () => [
      { type: "checkbox", value: "assembly", label: "Assembly Type", options: assemblyOptions },
      { type: "checkbox", value: "practice", label: "Practice", options: practiceOptions },
      { type: "checkbox", value: "joinery", label: "Joinery Type", options: joineryOptions },
      { type: "checkbox", value: "sub_joinery", label: "Sub Joinery", options: subJoineryOptions },
      { type: "checkbox", value: "loading_type", label: "Loading Type", options: loadingTypeOptions },
      { type: "checkbox", value: "uploader", label: "Uploader", options: uploaderOptions },
      { type: "checkbox", value: "connector", label: "Connector", options: ["true", "false"] },
      { type: "checkbox", value: "dowel", label: "Dowel", options: ["true", "false"] },
      {
        type: "slider",
        value: "replicate_tests",
        label: "Replicate Tests",
        min: replicateBounds.min,
        max: replicateBounds.max,
        step: 1,
      },
      {
        type: "slider",
        value: "fastener_numbers",
        label: "Fastener Count",
        min: fastenerBounds.min,
        max: fastenerBounds.max,
        step: 1,
      },
      {
        type: "slider",
        value: "e_yield_force",
        label: "Yield Force (kN)",
        min: yieldForceBounds.min,
        max: yieldForceBounds.max,
        step: 1,
      },
      {
        type: "slider",
        value: "e_max_force",
        label: "Max Force (kN)",
        min: maxForceBounds.min,
        max: maxForceBounds.max,
        step: 1,
      },
      {
        type: "slider",
        value: "e_yield_displacement",
        label: "Yield Displacement (mm)",
        min: yieldDispBounds.min,
        max: yieldDispBounds.max,
        step: 1,
      },
      {
        type: "slider",
        value: "e_max_displacement",
        label: "Max Displacement (mm)",
        min: maxDispBounds.min,
        max: maxDispBounds.max,
        step: 1,
      },
      {
        type: "slider",
        value: "e_ultimate_force",
        label: "Ultimate Force (kN)",
        min: ultimateForceBounds.min,
        max: ultimateForceBounds.max,
        step: 1,
      },
      {
        type: "slider",
        value: "e_ultimate_displacement",
        label: "Ultimate Displacement (mm)",
        min: ultimateDispBounds.min,
        max: ultimateDispBounds.max,
        step: 1,
      },
      {
        type: "slider",
        value: "e_stiffness",
        label: "Stiffness (kN/mm)",
        min: stiffnessBounds.min,
        max: stiffnessBounds.max,
        step: 1,
      },
      {
        type: "slider",
        value: "e_ductility",
        label: "Ductility",
        min: ductilityBounds.min,
        max: ductilityBounds.max,
        step: 1,
      },
    ],
    [
      assemblyOptions,
      practiceOptions,
      joineryOptions,
      subJoineryOptions,
      loadingTypeOptions,
      uploaderOptions,
      replicateBounds,
      fastenerBounds,
      yieldForceBounds,
      maxForceBounds,
      yieldDispBounds,
      maxDispBounds,
      ultimateForceBounds,
      ultimateDispBounds,
      stiffnessBounds,
      ductilityBounds,
    ],
  );

  const getSearchValue = (row: SpecimenPublic & { uploader_name?: string }, field: string) => {
    switch (field) {
      case "reference":
        return row.specimen_reference_id;
      case "assembly":
        return row.assembly_type;
      case "practice":
        return row.practice;
      case "joinery":
        return row.joinery_type?.label ?? "";
      case "sub_joinery":
        return row.sub_joinery_type?.label ?? "";
      case "loading_type":
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
      .filter((token): token is { field: string; value: string } => token !== null);
  }, [searchField, searchTerm, fieldOptions]);

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return rows.filter((row) => {
      const referenceText = row.specimen_reference_id.toLowerCase();
      const matchesQuery =
        commandTokens.length > 0
          ? commandTokens.every((token) =>
              getSearchValue(row, token.field).toLowerCase().includes(token.value),
            )
          : query.length === 0
            ? true
            : getSearchValue(row, searchField).toLowerCase().includes(query) ||
              (searchField === "all" && referenceText.includes(query));

      const matchesAssembly =
        assemblyFilters.length === 0 ||
        assemblyFilters.includes(row.assembly_type);

      const matchesPractice =
        practiceFilters.length === 0 || practiceFilters.includes(row.practice);

      const matchesJoinery =
        joineryFilters.length === 0 ||
        joineryFilters.includes(row.joinery_type?.label ?? "");

      const matchesSubJoinery =
        subJoineryFilters.length === 0 ||
        subJoineryFilters.includes(row.sub_joinery_type?.label ?? "");

      const matchesLoadingType =
        loadingTypeFilters.length === 0 ||
        loadingTypeFilters.includes(row.e_test_loading_type ?? "");

      const matchesUploader =
        uploaderFilters.length === 0 ||
        uploaderFilters.includes((row as any).uploader_name ?? row.uploader_id);

      const matchesConnector =
        connectorFilters.length === 0 ||
        connectorFilters.includes(row.connector ? "true" : "false");

      const matchesDowel =
        dowelFilters.length === 0 ||
        dowelFilters.includes(row.dowel ? "true" : "false");

      const replicateRange =
        sliderValuesByField.replicate_tests ?? sliderDefaults.replicate_tests;
      const fastenerRange =
        sliderValuesByField.fastener_numbers ?? sliderDefaults.fastener_numbers;
      const yieldRange =
        sliderValuesByField.e_yield_force ?? sliderDefaults.e_yield_force;
      const maxRange =
        sliderValuesByField.e_max_force ?? sliderDefaults.e_max_force;
      const yieldDispRange =
        sliderValuesByField.e_yield_displacement ??
        sliderDefaults.e_yield_displacement;
      const maxDispRange =
        sliderValuesByField.e_max_displacement ??
        sliderDefaults.e_max_displacement;
      const ultimateForceRange =
        sliderValuesByField.e_ultimate_force ?? sliderDefaults.e_ultimate_force;
      const ultimateDispRange =
        sliderValuesByField.e_ultimate_displacement ??
        sliderDefaults.e_ultimate_displacement;
      const stiffnessRange =
        sliderValuesByField.e_stiffness ?? sliderDefaults.e_stiffness;
      const ductilityRange =
        sliderValuesByField.e_ductility ?? sliderDefaults.e_ductility;

      const matchesReplicateSlider =
        row.replicate_tests >= replicateRange[0] &&
        row.replicate_tests <= replicateRange[1];
      const matchesFastenerSlider =
        row.fastener_numbers >= fastenerRange[0] &&
        row.fastener_numbers <= fastenerRange[1];
      const matchesYieldSlider = hasNumber(row.e_yield_force)
        ? row.e_yield_force >= yieldRange[0] &&
          row.e_yield_force <= yieldRange[1]
        : true;
      const matchesMaxSlider = hasNumber(row.e_max_force)
        ? row.e_max_force >= maxRange[0] && row.e_max_force <= maxRange[1]
        : true;
      const matchesYieldDispSlider = hasNumber(row.e_yield_displacement)
        ? row.e_yield_displacement >= yieldDispRange[0] &&
          row.e_yield_displacement <= yieldDispRange[1]
        : true;
      const matchesMaxDispSlider = hasNumber(row.e_max_displacement)
        ? row.e_max_displacement >= maxDispRange[0] &&
          row.e_max_displacement <= maxDispRange[1]
        : true;
      const matchesUltimateForceSlider = hasNumber(row.e_ultimate_force)
        ? row.e_ultimate_force >= ultimateForceRange[0] &&
          row.e_ultimate_force <= ultimateForceRange[1]
        : true;
      const matchesUltimateDispSlider = hasNumber(row.e_ultimate_displacement)
        ? row.e_ultimate_displacement >= ultimateDispRange[0] &&
          row.e_ultimate_displacement <= ultimateDispRange[1]
        : true;
      const matchesStiffnessSlider = hasNumber(row.e_stiffness)
        ? row.e_stiffness >= stiffnessRange[0] &&
          row.e_stiffness <= stiffnessRange[1]
        : true;
      const matchesDuctilitySlider = hasNumber(row.e_ductility)
        ? row.e_ductility >= ductilityRange[0] &&
          row.e_ductility <= ductilityRange[1]
        : true;

      return (
        matchesQuery &&
        matchesAssembly &&
        matchesPractice &&
        matchesJoinery &&
        matchesSubJoinery &&
        matchesLoadingType &&
        matchesUploader &&
        matchesConnector &&
        matchesDowel &&
        matchesReplicateSlider &&
        matchesFastenerSlider &&
        matchesYieldSlider &&
        matchesMaxSlider &&
        matchesYieldDispSlider &&
        matchesMaxDispSlider &&
        matchesUltimateForceSlider &&
        matchesUltimateDispSlider &&
        matchesStiffnessSlider &&
        matchesDuctilitySlider
      );
    });
  }, [
    rows,
    searchTerm,
    searchField,
    commandTokens,
    assemblyFilters,
    practiceFilters,
    joineryFilters,
    subJoineryFilters,
    loadingTypeFilters,
    uploaderFilters,
    connectorFilters,
    dowelFilters,
    sliderValuesByField,
    sliderDefaults,
  ]);

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    searchField !== "all" ||
    assemblyFilters.length > 0 ||
    practiceFilters.length > 0 ||
    joineryFilters.length > 0 ||
    subJoineryFilters.length > 0 ||
    loadingTypeFilters.length > 0 ||
    uploaderFilters.length > 0 ||
    connectorFilters.length > 0 ||
    dowelFilters.length > 0 ||
    Object.keys(sliderDefaults).some((key) => {
      const current = sliderValuesByField[key];
      const baseline = sliderDefaults[key as keyof typeof sliderDefaults];
      return (
        !!current &&
        (current[0] !== baseline[0] || current[1] !== baseline[1])
      );
    });

  const toggleFilter = (
    value: string,
    setSelected: (updater: string[] | ((prev: string[]) => string[])) => void,
  ) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    );
  };

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [
    searchTerm,
    searchField,
    assemblyFilters,
    practiceFilters,
    joineryFilters,
    subJoineryFilters,
    loadingTypeFilters,
    uploaderFilters,
    connectorFilters,
    dowelFilters,
    sliderValuesByField,
    sliderDefaults,
  ]);

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
          onResetFilters={() => {
            setSearchTerm("");
            setSearchField("all");
            setAssemblyFilters([]);
            setPracticeFilters([]);
            setJoineryFilters([]);
            setSubJoineryFilters([]);
          setLoadingTypeFilters([]);
          setUploaderFilters([]);
          setConnectorFilters([]);
          setDowelFilters([]);
          setSliderValuesByField(sliderDefaults);
          }}
        />

        {/* Main results grid: this is the actual list of specimens users can scan and click into. */}
        <div className="min-h-0 flex-1 overflow-auto rounded-md border">
          <Table>
            {/* Frozen header row: column names stay visible while the table content scrolls. */}
            <TableHeader className="sticky top-0 z-10 bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="sticky top-0 z-10 bg-muted/50">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer hover:bg-muted/40"
                    onClick={() =>
                      navigate({
                        to: "/specimens/$specimenId",
                        params: { specimenId: row.original.id },
                      })
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {(() => {
                          // Special-case column formatting: some raw values need custom display tweaks.
                          const meta = cell.column.columnDef.meta;

                          if (meta?.renderAs === "joinery_label") {
                            return (
                              (cell.row.original as any).joinery_type?.label ||
                              "N/A"
                            );
                          }
                          if (meta?.renderAs === "sub_joinery_label") {
                            return (
                              (cell.row.original as any).sub_joinery_type
                                ?.label || "N/A"
                            );
                          }
                          if (meta?.renderAs === "array_join") {
                            const value = cell.getValue();
                            return Array.isArray(value)
                              ? value.join(", ")
                              : value;
                          }
                          if (meta?.renderAs === "array_labels") {
                            const value = cell.getValue() as any[];
                            return (
                              value
                                ?.map((item) => item?.label)
                                ?.filter(Boolean)
                                ?.join(", ") || "None"
                            );
                          }
                          if (meta?.renderAs === "uploader_name") {
                            return (
                              (cell.row.original as any).uploader_name ||
                              cell.getValue() ||
                              "Unknown"
                            );
                          }

                          // Default rendering path for all normal columns without special formatting rules.
                          return (
                            flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            ) ?? ""
                          );
                        })()}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={kitColumns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {/* Bottom pager: lets users move between pages and control how many rows are shown. */}
        <DataTablePagination table={table} pagination={pagination} />
      </div>

      <aside
        className={`w-full min-h-0 overflow-hidden rounded-md border sm:w-72 sm:min-w-72 sm:max-w-72 md:w-80 md:min-w-80 md:max-w-80 ${TABLE_PANEL_HEIGHT} ${
          controlsOpen ? "block" : "hidden"
        }`}
      >
        <div className="sticky top-0 z-10 border-b bg-background p-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Filters</h3>
            <div className="flex items-center gap-1">

              {/* Toggles every filter subsection open/closed in one click. */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const nextCollapsedState = !allControlsCollapsed;
                  setToggleAllOpenState(!nextCollapsedState);
                  setToggleAllSignal((prev) => prev + 1);
                }}
              >
                {allControlsCollapsed ? "Expand all" : "Collapse all"}
              </Button>

              {/* Clears all active filters and resets sliders/search back to defaults. */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSearchField("all");
                  setAssemblyFilters([]);
                  setPracticeFilters([]);
                  setJoineryFilters([]);
                  setSubJoineryFilters([]);
                  setLoadingTypeFilters([]);
                  setUploaderFilters([]);
                  setConnectorFilters([]);
                  setDowelFilters([]);
                  setSliderValuesByField(sliderDefaults);
                }}
              >
                Clear
              </Button>
              
            </div>
          </div>
        </div>
        <div className="h-[calc(100%-57px)] overflow-auto p-3">
          <DataTableFilterControls
            fields={filterFields}
            selectedByField={{
              assembly: assemblyFilters,
              practice: practiceFilters,
              joinery: joineryFilters,
              sub_joinery: subJoineryFilters,
              loading_type: loadingTypeFilters,
              uploader: uploaderFilters,
              connector: connectorFilters,
              dowel: dowelFilters,
            }}
            sliderValuesByField={sliderValuesByField}
            onToggleOption={(field, option) => {
              if (field === "assembly") toggleFilter(option, setAssemblyFilters);
              if (field === "practice") toggleFilter(option, setPracticeFilters);
              if (field === "joinery") toggleFilter(option, setJoineryFilters);
              if (field === "sub_joinery")
                toggleFilter(option, setSubJoineryFilters);
              if (field === "loading_type")
                toggleFilter(option, setLoadingTypeFilters);
              if (field === "uploader") toggleFilter(option, setUploaderFilters);
              if (field === "connector")
                toggleFilter(option, setConnectorFilters);
              if (field === "dowel") toggleFilter(option, setDowelFilters);
            }}
            onSliderChange={(field, value) => {
              setSliderValuesByField((prev) => ({ ...prev, [field]: value }));
            }}
            onResetField={(field) => {
              if (field === "assembly") setAssemblyFilters([]);
              if (field === "practice") setPracticeFilters([]);
              if (field === "joinery") setJoineryFilters([]);
              if (field === "sub_joinery") setSubJoineryFilters([]);
              if (field === "loading_type") setLoadingTypeFilters([]);
              if (field === "uploader") setUploaderFilters([]);
              if (field === "connector") setConnectorFilters([]);
              if (field === "dowel") setDowelFilters([]);
              if (field in sliderDefaults) {
                setSliderValuesByField((prev) => ({
                  ...prev,
                  [field]: sliderDefaults[field as keyof typeof sliderDefaults],
                }));
              }
            }}
            toggleAllSignal={toggleAllSignal}
            toggleAllOpenState={toggleAllOpenState}
            onAllCollapsedChange={setAllControlsCollapsed}
          />
        </div>
      </aside>
    </div>
  );
}

function Specimens() {
  return (
    <div className="w-full min-h-0">
      {/* <SpecimensTable /> */}
      <SpecimensKitTable />
    </div>
  );
}
