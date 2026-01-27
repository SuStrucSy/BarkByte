import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { specimensReadSpecimens } from "@/api/endpoints/specimens/specimens.gen";
import type { SpecimenPublic, SpecimensReadSpecimensParams } from "@/api/model";
import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { ScatterPlotD3 } from "@/components/Dashboard/ScatterPlot";
import { useFastenertypeGetFastenerTypes } from "@/api/endpoints/fastenertype/fastenertype.gen";
import { groupSpecimensByFastener } from "@/lib/utils";
import { BoxPlot } from "@/components/Dashboard/BoxPlot";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ReplaceIcon, WrenchIcon } from "lucide-react";
import {
  EXPERIMENTAL_KEYS,
  getExperimentalLabel,
  getFullLabel,
  type ExperimentalKey,
} from "@/lib/constants";
import { SpecimenSheet } from "@/components/Specimens/SpecimenSheet";
import { PageLoading } from "@/components/Dashboard/PageLoading";

export const Route = createFileRoute("/_layout/dashboard")({
  staticData: {
    title: "Dashboard",
  },
  component: Dashboard,
});

function Dashboard() {
  const pageSize = 1000;
  const [selectedFastener, setSelectedFastener] = useState<string>("");
  const [mirrorPosition, setMirrorPosition] = useState(0);
  const [smoothing, setSmoothing] = useState<boolean>(false);
  const [yKey, setYKey] = useState<ExperimentalKey>(EXPERIMENTAL_KEYS[0]);
  const [selectedSpecimen, setSelectedSpecimen] =
    useState<SpecimenPublic | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handlePointClick = useCallback((specimen: SpecimenPublic) => {
    setSelectedSpecimen(specimen);
    setSheetOpen(true);
  }, []);

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["specimens", "dashboard"],
    queryFn: async ({ pageParam = 0 }) => {
      const params: SpecimensReadSpecimensParams = {
        limit: pageSize,
        skip: pageParam,
      };
      return specimensReadSpecimens(params);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      const specimens = lastPage.data;
      return specimens.length === pageSize
        ? pages.length * pageSize
        : undefined;
    },
  });

  const { isLoading: isFastenerLoading, data: fastenerTypesData } =
    useFastenertypeGetFastenerTypes();

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allSpecimens = useMemo(
    () => infiniteData?.pages.flatMap((page) => page.data) ?? [],
    [infiniteData],
  );
  const totalCount = infiniteData?.pages[0]?.count ?? 0;
  const loadedCount = allSpecimens.length;
  const isLoadingAll = hasNextPage || isFetchingNextPage;

  // Group specimens by fastener type
  const groupsByFastenerType = useMemo(
    () =>
      groupSpecimensByFastener(
        { count: 0, data: allSpecimens },
        fastenerTypesData,
      ),
    [allSpecimens, fastenerTypesData],
  );

  const fastenerTypes = useMemo(
    () => Object.keys(groupsByFastenerType),
    [groupsByFastenerType],
  );

  const selectedSpecimens = useMemo(
    () => groupsByFastenerType[selectedFastener] || [],
    [groupsByFastenerType, selectedFastener],
  );

  if (isLoading || isFastenerLoading) {
    return <PageLoading />;
  }

  const yLabel = getExperimentalLabel(yKey);

  return (
    <div className="space-y-4">
      {/* Header with loading status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Specimen Analysis Dashboard</CardTitle>
              <CardDescription>
                {loadedCount.toLocaleString()} / {totalCount.toLocaleString()}{" "}
                specimens
                {isLoadingAll ? (
                  <Badge variant="secondary" className="animate-pulse ml-1">
                    Loading...{" "}
                    {totalCount > 0
                      ? Math.round((loadedCount / totalCount) * 100)
                      : 0}
                    %
                  </Badge>
                ) : (
                  <Badge className="ml-1">✓ Complete</Badge>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Two column grid of charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Stiffness vs Ductility */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Stiffness vs Ductility</CardTitle>
            <CardDescription>
              Analyzing structural performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <ScatterPlotD3
              data={allSpecimens}
              fastenerTypesData={fastenerTypesData}
              xKey="e_stiffness"
              yKey="e_ductility"
              xLabel="Stiffness (Ks) [KN/mm]"
              yLabel="Ductility"
              height={500}
              title="Stiffness vs Ductility"
              onPointClick={handlePointClick}
            />
          </CardContent>
        </Card>

        {/* Stiffness vs Yield Force */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Stiffness vs Yield Force</CardTitle>
            <CardDescription>
              Stiffness-force relationship analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <ScatterPlotD3
              data={allSpecimens.filter((s) => s.e_yield_force != null)}
              fastenerTypesData={fastenerTypesData}
              xKey="e_stiffness"
              yKey="e_yield_force"
              xLabel="Stiffness (Ks) [KN/mm]"
              yLabel="Yield Strength (Fy) [KN]"
              height={500}
              title="Stiffness vs Yield Force"
              onPointClick={handlePointClick}
            />
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader className="pb-4">
            <CardTitle>Boxplot</CardTitle>
            <CardDescription>
              Summarizes the distribution of {yLabel} grouped by joinery type
            </CardDescription>
            <CardAction>
              <Item variant="muted">
                <ItemMedia variant="icon">
                  <ReplaceIcon />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Chart Options</ItemTitle>
                  <ItemDescription>
                    Select fastener type and/or experimental value
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Select
                    onValueChange={(value) => setSelectedFastener(value)}
                    defaultValue={selectedFastener}
                  >
                    <SelectTrigger className="w-full max-w-48">
                      <SelectValue placeholder="Select a fastener" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Fastener</SelectLabel>
                        {fastenerTypes.map((fastener) => (
                          <SelectItem key={fastener} value={fastener}>
                            {fastener}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Select
                    onValueChange={(value) => setYKey(value as ExperimentalKey)}
                    defaultValue={yKey}
                  >
                    <SelectTrigger className="w-full max-w-48">
                      <SelectValue placeholder="Select an experimental value" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Experimental Value</SelectLabel>
                        {EXPERIMENTAL_KEYS.map((expValue) => (
                          <SelectItem key={expValue} value={expValue}>
                            {getExperimentalLabel(expValue)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </ItemActions>
              </Item>
            </CardAction>
          </CardHeader>
          <CardContent className="pb-4">
            <BoxPlot
              selectedSpecimens={selectedSpecimens}
              yKey={yKey}
              yLabel={getFullLabel(yKey)}
              mirrorPosition={mirrorPosition}
              smoothing={smoothing}
              onPointClick={handlePointClick}
            />
          </CardContent>
          <CardFooter>
            <Item variant="outline">
              <ItemMedia variant="icon">
                <WrenchIcon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Chart Options</ItemTitle>
                <ItemDescription>
                  Can toggle betweeen a box plot and a violin plot
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Switch
                  id="mirror"
                  onCheckedChange={(checked) =>
                    setMirrorPosition(checked ? 1 : 0)
                  }
                  checked={mirrorPosition === 1}
                />
                <Label htmlFor="mirror">Violin</Label>
                <Switch
                  id="smoothing"
                  onCheckedChange={(checked) => setSmoothing(checked)}
                  checked={smoothing}
                />
                <Label htmlFor="smoothing">Smoothing</Label>
              </ItemActions>
            </Item>
          </CardFooter>
        </Card>
      </div>
      <SpecimenSheet
        specimen={selectedSpecimen}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
      {/* Loading progress indicator */}
      {isLoadingAll && (
        <div className="flex flex-col items-center gap-4">
          <Item variant="outline">
            <ItemMedia>
              <Spinner />
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="line-clamp-1">
                Loading all specimens...
              </ItemTitle>
            </ItemContent>
            <ItemContent className="flex-none justify-end">
              <span className="text-sm tabular-nums">
                {loadedCount.toLocaleString()} / {totalCount.toLocaleString()}
              </span>
            </ItemContent>
          </Item>
        </div>
      )}
    </div>
  );
}
