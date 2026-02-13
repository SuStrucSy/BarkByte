import { TabsContent } from "../ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { LabelValue } from "../Common/LabelValue";
import { Separator } from "../ui/separator";
import type { SpecimenPublic } from "@/api/model";
import { MoistureDial } from "../Dashboard/MoistureDial";

type SpecimenTabStructuralProps = {
  data: SpecimenPublic;
};

export function SpecimenTabStructural({ data }: SpecimenTabStructuralProps) {
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
    <TabsContent value="Structural Data">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Structural Data</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1fr_auto_2fr] md:items-start">
          <div className="grid gap-2">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              Geometric Properties
            </h3>
            <LabelValue property="element_dimension" data={data} />
            <MoistureDial
              value={moistureChartData[0].moisture}
              label="Moisture Percentage"
              className="max-w-[200px]"
            />
          </div>
          <Separator orientation="vertical" className="hidden md:block" />
          <div className="grid gap-2">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              Material Properties
            </h3>
            <LabelValue property="wood_type" data={data} />
            <LabelValue property="wood_mechanical_properties" data={data} />
            <LabelValue property="fastener_mechanical_properties" data={data} />
            <LabelValue
              property="connector_mechanical_properties"
              data={data}
            />
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
