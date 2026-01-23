import { ChevronRightIcon, ExternalLinkIcon } from "lucide-react"
import { createFileRoute, Link } from "@tanstack/react-router";
import { useDoiGetDoiById } from "@/api/endpoints/doi/doi.gen";
import { useSpecimensReadSpecimen } from "@/api/endpoints/specimens/specimens.gen";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle
} from "@/components/ui/item"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { LabelValue } from "@/components/Common/LabelValue";
import { MoistureDial } from "@/components/Dashboard/MoistureDial";
import { RadarMetricsChart } from "@/components/Dashboard/RadarMetricsChart";
import { renderValue } from "@/lib/utils";
import type { ta } from "zod/v4/locales";

export const Route = createFileRoute("/_layout/specimens/$specimenId")({
	staticData: {
		title: "Specimen Details",
	},
	component: SpecimenDetails,
});


function SpecimenDetails() {
	const { specimenId } = Route.useParams();
	const { data, isLoading, isError, error } =
		useSpecimensReadSpecimen(specimenId);
	const doiId = data?.doi?.id ?? "";
	const { data: doiData } = useDoiGetDoiById(doiId, {
		query: {
			enabled: !!doiId,
		},
	});

	if (isLoading) {
		return <div>Loading specimen...</div>;
	}

	if (isError) {
		return (
			<div>
				Failed to load specimen: {error?.message ?? "Unknown error"}
			</div>
		);
	}

	if (!data) {
		return <div>Specimen not found.</div>;
	}

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
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-4xl font-semibold">
						{data.specimen_reference_id ?? data.id}
					</h1>
				</div>
				<Button variant="outline" asChild>
					<Link to="/specimens">Back to specimens</Link>
				</Button>
			</div>
			<div className="grid gap-6 text-sm">
				<Tabs defaultValue="Meta Data">
					<TabsList>
						<TabsTrigger value="Meta Data">Meta Data</TabsTrigger>
						<TabsTrigger value="Structural Data">Structural Data</TabsTrigger>
						<TabsTrigger value="Experimental Data">Experimental Data</TabsTrigger>
					</TabsList>
					<TabsContent value="Meta Data">
						<Card>
							<CardHeader>
								<CardTitle className="text-2xl">Meta Data</CardTitle>
							</CardHeader>
							<CardContent className="grid gap-4 md:grid-cols-[2fr_auto_1fr] md:items-start">
								<div className="grid gap-3">
									<h3 className="text-xl font-semibold tracking-tight text-foreground">Specimen Information</h3>
									<div className="grid gap-4 md:grid-cols-2">
										<div className="grid gap-2">
											<LabelValue property="assembly_type" data={data} />
											<LabelValue property="joinery_type" data={data} />
											<LabelValue property="sub_joinery_type" data={data} />
											<LabelValue property="fastener_types" data={data} />
											<LabelValue property="loading_directions" data={data} />
											<LabelValue property="practice" data={data} />
										</div>
										<div className="grid gap-2">
											<LabelValue property="fastener_numbers" data={data} />
											<LabelValue property="connector" data={data} />
											<LabelValue property="dowel" data={data} />
											<LabelValue property="replicate_tests" data={data} />
											<LabelValue property="connection_description" data={data} />
											<LabelValue property="note" data={data} />
										</div>
									</div>
								</div>
								<Separator orientation="vertical" className="hidden md:block"/>
								<div className="grid gap-2">
									<h3 className="text-xl font-semibold tracking-tight text-foreground">Identification Information</h3>
									<Item variant="outline" asChild>
										<div>
											<ItemContent>
												<ItemTitle>Specimen ID</ItemTitle>
												<ItemDescription>{data.id}</ItemDescription>
											</ItemContent>
										</div>
									</Item>

									<Item variant="outline">
										<ItemContent>
											<ItemTitle>DOI Reference</ItemTitle>
											<ItemDescription>
												{data.doi.ref_title}
											</ItemDescription>
										</ItemContent>
										<ItemActions>
											<Sheet>
												<SheetTrigger asChild>
													<Button size="sm" variant="outline">
														Details
													</Button>
												</SheetTrigger>
												<SheetContent className="px-6 py-6">
													<h3 className="text-xl font-semibold tracking-tight text-foreground">DOI Details</h3>														
													<div className="space-y-4">
														<dl className="grid gap-3 ">
															<div className="grid gap-1">
															<dt className="text-xs font-medium text-muted-foreground">Title</dt>
															<dd className="text-sm">{data.doi.ref_title}</dd>
															</div>

															<div className="grid gap-1">
															<dt className="text-xs font-medium text-muted-foreground">Author(s)</dt>
															<dd className="text-sm">{data.doi.authors}</dd>
															</div>

															<div className="grid gap-1">
															<dt className="text-xs font-medium text-muted-foreground">Publication year</dt>
															<dd className="text-sm">{data.doi.pub_year}</dd>
															</div>
														</dl>
														<Item variant="outline" asChild>
															<a href={data.doi.link} target="_blank" rel="noopener noreferrer">
																<ItemContent>
																	<ItemTitle>Link</ItemTitle>
																	<ItemDescription>
																		For more information, please visit the doi.
																	</ItemDescription>
																</ItemContent>
																<ItemActions>
																	<ExternalLinkIcon className="ml-1 inline-block h-4 w-4" />
																</ItemActions>
															</a>
														</Item>

														<h3 className="text-xl font-semibold tracking-tight text-foreground">Specimens</h3>
														<div className="grid gap-2 overflow-y-auto">
															{(doiData?.specimens?.data ?? [])
																.filter((specimen) => specimen.id !== data.id)
																.map((specimen) => (
																<Item key={specimen.id} variant="outline" asChild>
																	<a href={`/specimens/${specimen.id}`} target="_blank">
																		<ItemContent>
																			<ItemTitle>{specimen.specimen_reference_id ?? specimen.id}</ItemTitle>
																			<ItemDescription>
																				{renderValue(specimen.joinery_type.label)}
																			</ItemDescription>
																		</ItemContent>
																		<ItemActions>
																			<ChevronRightIcon className="size-4" />
																		</ItemActions>
																	</a>
																</Item>
															))}
														</div>
													</div>
													<SheetFooter>
														<SheetClose asChild>
															<Button variant="outline">Close</Button>
														</SheetClose>
													</SheetFooter>
												</SheetContent>
											</Sheet>
										</ItemActions>
									</Item>


									
								</div>
							</CardContent>
						</Card>
					</TabsContent>
					<TabsContent value="Structural Data">
						<Card>
							<CardHeader>
								<CardTitle className="text-2xl">Structural Data</CardTitle>
							</CardHeader>
							<CardContent className="grid gap-4 md:grid-cols-[1fr_auto_2fr] md:items-start">
								<div className="grid gap-2">
									<h3 className="text-xl font-semibold tracking-tight text-foreground">Geometric Properties</h3>
									<LabelValue property="element_dimension" data={data} />
									<MoistureDial value={moistureChartData[0].moisture} label="Moisture Percentage" className="max-w-[200px]" />
								</div>
								<Separator orientation="vertical" className="hidden md:block"/>
								<div className="grid gap-2">
									<h3 className="text-xl font-semibold tracking-tight text-foreground">Material Properties</h3>
									<LabelValue property="wood_type" data={data} />
									<LabelValue property="wood_mechanical_properties" data={data} />
									<LabelValue property="fastener_mechanical_properties" data={data} />
									<LabelValue property="connector_mechanical_properties" data={data} />
								</div>
							</CardContent>
						</Card>
					</TabsContent>
					<TabsContent value="Experimental Data">
						<Card>
							<CardHeader>
								<CardTitle className="text-2xl">Experimental Data</CardTitle>
							</CardHeader>
							<CardContent className="grid gap-6 lg:grid-cols-2 lg:items-start">
								<div className="grid gap-2">
									<h3 className="text-xl font-semibold tracking-tight text-foreground">Experimental Results</h3>
									<LabelValue property="e_date" data={data} />
									<LabelValue property="e_test_loading_type" data={data} />
									<LabelValue property="e_yield_point_method" data={data} />
									<LabelValue property="note" data={data} />
									
									<div className="grid gap-2">
										<h3 className="text-xl font-semibold tracking-tight text-foreground">Qualitative Failure Measures</h3>
										<LabelValue property="e_qualitative_failure_measure" data={data} />
										<LabelValue property="e_qfm_description" data={data} />
									</div>
								</div>
								<div className="grid w-full justify-self-stretch gap-6">
									<div className="grid gap-2 min-w-0 overflow-hidden">
										<h3 className="text-xl font-semibold tracking-tight text-foreground">Quantitative Mechanical Measures</h3>
										<RadarMetricsChart data={data} />
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
			{/* <Separator className="my-10" />
			<pre className="rounded-md bg-muted p-4 text-xs overflow-x-auto whitespace-pre-wrap break-words max-w-full">
				{JSON.stringify(data, null, 2)}
			</pre> */}
		</div>
	);
}
