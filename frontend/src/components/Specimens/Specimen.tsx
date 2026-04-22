import type { SpecimenPublic } from "@/api/model";
import { LabelValue } from "@/components/Common/LabelValue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSpecimenDisplayLabel } from "@/lib/utils";
import { BackboneChart } from "./BackboneChart";
import { buildSpecimenBackboneModel } from "./buildSpecimenBackboneModel";
import { SpecimenFailureModeLinks } from "./SpecimenFailureModeLinks";
import { SpecimenHeader } from "./SpecimenHeader";
import { SpecimenTabMeta } from "./SpecimenTabMeta";
import { SpecimenTabStructural } from "./SpecimenTabStructural";
import { SpecimenVersionHistory } from "./SpecimenVersionHistory";

// Page component for the specimen detail view.
type SpecimenProps = {
	data: SpecimenPublic;
	setSheetOpen: (open: boolean) => void;
	onEditClick: () => void;
};

export function Specimen({ data, setSheetOpen, onEditClick }: SpecimenProps) {
	// Build the chart model once from this specimen's experimental values.
	const backboneModel = buildSpecimenBackboneModel(data);

	return (
		<>
			<SpecimenHeader
				title={getSpecimenDisplayLabel(data)}
				onEditClick={onEditClick}
			/>

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
							<CardContent className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
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
										<SpecimenFailureModeLinks
											failureModes={data.e_qualitative_failure_measure}
										/>
										<LabelValue property="e_qfm_description" data={data} />
									</div>
								</div>
								<div className="grid h-full w-full justify-self-stretch gap-6">
									<div className="grid h-full min-w-0 gap-2">
										<h3 className="text-xl font-semibold tracking-tight text-foreground">
											Quantitative Mechanical Measures
										</h3>
										<BackboneChart model={backboneModel} />
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
				<SpecimenVersionHistory specimenId={data.id} />
			</div>
		</>
	);
}
