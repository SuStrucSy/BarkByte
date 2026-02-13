import { Link } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { LabelValue } from "@/components/Common/LabelValue";
import { RadarMetricsChart } from "@/components/Dashboard/RadarMetricsChart";
import { MoistureDial } from "@/components/Dashboard/MoistureDial";
import type { SpecimenPublic } from "@/api/model";
import { SpecimenHeader } from "./SpecimenHeader";
import { SpecimenTabMeta } from "./SpecimenTabMeta";
import { SpecimenTabStructural } from "./SpecimenTabStructural";

type SpecimenProps = {
  data: SpecimenPublic;
  setSheetOpen: (open: boolean) => void;
};

export function Specimen({ data, setSheetOpen }: SpecimenProps) {
  const moistureValue = Number(
    String(data.moisture_percentage ?? "").replace("%", ""),
  );
  const moistureChartData = [
    {
      name: "Moisture",
      moisture: Number.isFinite(moistureValue) ? moistureValue : 0,
    },
  ];
  return (
    <>
      <SpecimenHeader id={data.specimen_reference_id ?? data.id} />

      <div className="grid gap-6 text-sm">
        <Tabs defaultValue="Meta Data">
          <TabsList>
            <TabsTrigger value="Meta Data">Meta Data</TabsTrigger>
            <TabsTrigger value="Structural Data">Structural Data</TabsTrigger>
            <TabsTrigger value="Experimental Data">
              Experimental Data
            </TabsTrigger>
          </TabsList>
          <SpecimenTabMeta data={data} setSheetOpen={setSheetOpen} />
          <SpecimenTabStructural data={data} />
          <TabsContent value="Experimental Data">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Experimental Data</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-2 lg:items-start">
                <div className="grid gap-2">
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">
                    Experimental Results
                  </h3>
                  <LabelValue property="e_date" data={data} />
                  <LabelValue property="e_test_loading_type" data={data} />
                  <LabelValue property="e_yield_point_method" data={data} />
                  <LabelValue property="note" data={data} />
                  <div className="mt-5 grid gap-2">
                    <h3 className="text-xl font-semibold tracking-tight text-foreground">
                      Qualitative Failure Measures
                    </h3>
                    <LabelValue
                      property="e_qualitative_failure_measure"
                      data={data}
                    />
                    <LabelValue property="e_qfm_description" data={data} />
                  </div>
                </div>
                <div className="grid w-full justify-self-stretch gap-6">
                  <div className="grid gap-2 min-w-0 overflow-hidden">
                    <h3 className="text-xl font-semibold tracking-tight text-foreground">
                      Quantitative Mechanical Measures
                    </h3>
                    <RadarMetricsChart data={data} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
