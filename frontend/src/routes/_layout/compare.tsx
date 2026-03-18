import { specimensReadSpecimens } from "@/api/endpoints/specimens/specimens.gen";
import type { SpecimenPublic } from "@/api/model";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  EXPERIMENTAL_KEYS,
  getExperimentalLabel,
  getExperimentalUnit,
} from "@/lib/constants";
import { humanizeLabel } from "@/lib/utils";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Columns3, Plus, Search, X } from "lucide-react";
import { Fragment, useMemo, useState } from "react";

export const Route = createFileRoute("/_layout/compare")({
  staticData: {
    title: "Compare",
  },
  component: ComparePage,
});

type CompareField = {
  key: keyof SpecimenPublic;
  label: string;
  unit?: string;
  render: (specimen: SpecimenPublic) => string;
};

const EXPERIMENTAL_KEY_SET = new Set<string>(EXPERIMENTAL_KEYS);

function formatCompareValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "—";
    }

    return value.map((item) => formatCompareValue(item)).join(", ");
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;

    if (typeof record.label === "string" && record.label.trim().length > 0) {
      return record.label;
    }

    if (typeof record.ref_title === "string" && record.ref_title.trim().length > 0) {
      const authors =
        typeof record.authors === "string" && record.authors.trim().length > 0
          ? ` (${record.authors})`
          : "";
      return `${record.ref_title}${authors}`;
    }

    if (typeof record.id === "string" && record.id.trim().length > 0) {
      return record.id;
    }

    const scalarEntries = Object.entries(record)
      .filter(([, entryValue]) =>
        ["string", "number", "boolean"].includes(typeof entryValue),
      )
      .map(([entryKey, entryValue]) => `${humanizeLabel(entryKey)}: ${entryValue}`);

    if (scalarEntries.length > 0) {
      return scalarEntries.join(", ");
    }
  }

  return "—";
}

function getCompareLabel(key: keyof SpecimenPublic) {
  if (EXPERIMENTAL_KEY_SET.has(key)) {
    return getExperimentalLabel(key as (typeof EXPERIMENTAL_KEYS)[number]);
  }

  return humanizeLabel(key);
}

function getCompareUnit(key: keyof SpecimenPublic) {
  if (key === "moisture_percentage") {
    return "%";
  }

  if (EXPERIMENTAL_KEY_SET.has(key)) {
    return getExperimentalUnit(key as (typeof EXPERIMENTAL_KEYS)[number]);
  }

  return undefined;
}

function getCompareFields(specimen?: SpecimenPublic): CompareField[] {
  if (!specimen) {
    return [];
  }

  return (Object.keys(specimen) as Array<keyof SpecimenPublic>).map((key) => ({
    key,
    label: getCompareLabel(key),
    unit: getCompareUnit(key),
    render: (currentSpecimen) => formatCompareValue(currentSpecimen[key]),
  }));
}

function useAllSpecimens() {
  return useQuery({
    queryKey: ["specimens", "compare", "all"],
    queryFn: async () => {
      const pageSize = 500;
      let skip = 0;
      let total = 0;
      let rows: SpecimenPublic[] = [];

      do {
        const response = await specimensReadSpecimens({
          skip,
          limit: pageSize,
        });
        total = response.count;
        rows = rows.concat(response.data);
        skip += pageSize;
      } while (rows.length < total);

      return rows;
    },
    staleTime: 30_000,
  });
}

function getSpecimenSearchText(specimen: SpecimenPublic) {
  return [
    specimen.specimen_reference_id,
    specimen.joinery_type.label,
    specimen.sub_joinery_type.label,
    specimen.doi.ref_title,
    specimen.doi.authors,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function ComparePage() {
  const { data: specimens = [], isLoading, isError, error } = useAllSpecimens();
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedSpecimens = useMemo(
    () =>
      selectedIds
        .map((id) => specimens.find((specimen) => specimen.id === id))
        .filter((specimen): specimen is SpecimenPublic => Boolean(specimen)),
    [selectedIds, specimens],
  );

  const compareFields = useMemo(
    () => getCompareFields(selectedSpecimens[0] ?? specimens[0]),
    [selectedSpecimens, specimens],
  );

  const candidateSpecimens = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return specimens
      .filter((specimen) => !selectedIds.includes(specimen.id))
      .filter((specimen) =>
        normalizedQuery.length === 0
          ? true
          : getSpecimenSearchText(specimen).includes(normalizedQuery),
      )
      .slice(0, 8);
  }, [query, selectedIds, specimens]);

  const addSpecimen = (specimenId: string) => {
    setSelectedIds((current) =>
      current.includes(specimenId) ? current : [...current, specimenId],
    );
    setQuery("");
  };

  const removeSpecimen = (specimenId: string) => {
    setSelectedIds((current) => current.filter((id) => id !== specimenId));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        Loading specimens for comparison...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-destructive">
        Failed to load compare data: {error?.message || "Unknown error"}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Compare specimens</CardTitle>
          <CardDescription>
            Select one or more specimens to inspect their metadata and key
            experimental values side by side.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Build a specimen set, then compare every available attribute in a
            scrollable side-by-side matrix.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Selected specimens</CardTitle>
              <CardDescription>
                {selectedSpecimens.length} selected for comparison.
              </CardDescription>
            </div>
            {selectedSpecimens.length > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedIds([])}
              >
                Clear all
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-24 flex-wrap gap-2 rounded-lg border border-dashed p-3">
            {selectedSpecimens.length > 0 ? (
              selectedSpecimens.map((specimen) => (
                <Badge
                  key={specimen.id}
                  variant="secondary"
                  className="gap-2 px-3 py-1"
                >
                  <span>{specimen.specimen_reference_id}</span>
                  <button
                    aria-label={`Remove ${specimen.specimen_reference_id}`}
                    className="rounded-sm"
                    type="button"
                    onClick={() => removeSpecimen(specimen.id)}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                Start by adding specimens from the compare sidebar.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        {selectedSpecimens.length === 0 ? (
          <Empty className="min-h-[22rem] border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Columns3 className="size-5" />
              </EmptyMedia>
              <EmptyTitle>No specimens selected</EmptyTitle>
              <EmptyDescription>
                Add specimens from the right sidebar to build a side-by-side
                comparison view.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Side-by-side comparison</CardTitle>
              <CardDescription>
                Scroll vertically and horizontally to inspect all specimen
                attributes.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <ScrollArea className="h-[70vh] w-full whitespace-nowrap">
                <div
                  className="grid min-w-max"
                  style={{
                    gridTemplateColumns: `minmax(14rem, 16rem) repeat(${selectedSpecimens.length}, minmax(16rem, 1fr))`,
                  }}
                >
                  <div className="bg-background sticky top-0 left-0 z-30 border-b px-6 py-4">
                    <div className="text-muted-foreground text-xs font-medium uppercase tracking-[0.18em]">
                      Attribute
                    </div>
                  </div>
                  {selectedSpecimens.map((specimen) => (
                    <div
                      key={specimen.id}
                      className="bg-background sticky top-0 z-20 border-b border-l px-6 py-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold">
                            {specimen.specimen_reference_id}
                          </div>
                          <div className="text-muted-foreground mt-1 text-sm whitespace-normal">
                            {specimen.joinery_type.label}
                          </div>
                        </div>
                        <Button asChild size="sm" variant="outline">
                          <Link
                            params={{ specimenId: specimen.id }}
                            to="/specimens/$specimenId"
                          >
                            Open
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}

                  {compareFields.map((field) => (
                    <Fragment key={field.key}>
                      <div className="bg-background/95 sticky left-0 z-10 border-b px-6 py-4">
                        <div className="font-medium">{field.label}</div>
                        {field.unit ? (
                          <div className="text-muted-foreground mt-1 text-xs">
                            {field.unit}
                          </div>
                        ) : null}
                      </div>
                      {selectedSpecimens.map((specimen) => (
                        <div
                          key={`${field.key}-${specimen.id}`}
                          className="border-b border-l px-6 py-4"
                        >
                          <div className="max-w-sm whitespace-normal text-sm leading-6">
                            {field.render(specimen)}
                          </div>
                        </div>
                      ))}
                    </Fragment>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        <Card className="xl:sticky xl:top-6 xl:self-start">
          <CardHeader>
            <CardTitle>Add specimens</CardTitle>
            <CardDescription>
              Search by ID, joinery, or reference and add specimens into the
              comparison set.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="relative">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                id="compare-specimen-search"
                className="pl-9"
                placeholder="Search by ID, joinery, or reference"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="rounded-lg border">
              {candidateSpecimens.length > 0 ? (
                candidateSpecimens.map((specimen, index) => (
                  <button
                    key={specimen.id}
                    className="hover:bg-muted/50 relative flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors"
                    type="button"
                    onClick={() => addSpecimen(specimen.id)}
                  >
                    <div className="min-w-0">
                      <div className="font-medium">
                        {specimen.specimen_reference_id}
                      </div>
                      <div className="text-muted-foreground line-clamp-2 text-sm">
                        {specimen.joinery_type.label} /{" "}
                        {specimen.sub_joinery_type.label}
                      </div>
                      <div className="text-muted-foreground line-clamp-1 text-xs">
                        {specimen.doi.ref_title || "No reference title"}
                      </div>
                    </div>
                    <Plus className="mt-0.5 size-4 shrink-0" />
                    {index < candidateSpecimens.length - 1 ? (
                      <Separator className="absolute inset-x-4 bottom-0" />
                    ) : null}
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-sm text-muted-foreground">
                  No matching specimens found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
