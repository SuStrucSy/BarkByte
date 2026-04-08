import type { SpecimenPublic } from "@/api/model";
import { parseMoisturePercentage } from "@/lib/utils";
import { LabelValue } from "../Common/LabelValue";
import { MoistureDial } from "../Dashboard/MoistureDial";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { TabsContent } from "../ui/tabs";

type SpecimenTabStructuralProps = {
	data: SpecimenPublic;
};

export function SpecimenTabStructural({ data }: SpecimenTabStructuralProps) {
	const moistureValue = parseMoisturePercentage(data.moisture_percentage);

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
							value={moistureValue ?? 0}
							label="Moisture Percentage"
							className="m-4"
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
