import { Copy } from "lucide-react";
import { toast } from "sonner";
import type { SpecimenPublic } from "@/api/model";
import { Button } from "@/components/ui/button";
import { getSpecimenAddress } from "@/lib/utils";
import { LabelValue } from "../Common/LabelValue";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "../ui/item";
import { Separator } from "../ui/separator";
import { TabsContent } from "../ui/tabs";

type SpecimenTabMetaProps = {
	data: SpecimenPublic;
	setSheetOpen: (open: boolean) => void;
};

export function SpecimenTabMeta({ data, setSheetOpen }: SpecimenTabMetaProps) {
	const specimenAddress = getSpecimenAddress(data.id);

	const handleCopySpecimenAddress = async () => {
		await navigator.clipboard.writeText(specimenAddress);
		toast.success("Copied", {
			description: "Specimen address copied to clipboard.",
			position: "bottom-right",
		});
	};

	return (
		<TabsContent value="Meta Data">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Meta Data</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-4 lg:grid-cols-[2fr_auto_1fr] lg:items-start">
					<div className="grid gap-3">
						<h3 className="text-xl font-semibold tracking-tight text-foreground">
							Specimen Information
						</h3>
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
					<Separator orientation="vertical" className="hidden lg:block" />
					<div className="grid gap-2">
						<h3 className="text-xl font-semibold tracking-tight text-foreground">
							Identification Information
						</h3>
						<Item variant="outline" asChild>
							<div>
								<ItemContent>
									<ItemTitle>Specimen Link</ItemTitle>
									<ItemDescription>{specimenAddress}</ItemDescription>
								</ItemContent>
								<ItemActions>
									<Button
										variant="outline"
										size="icon"
										type="button"
										onClick={() => void handleCopySpecimenAddress()}
										aria-label="Copy specimen link"
										title="Copy specimen link"
									>
										<Copy className="h-4 w-4" />
									</Button>
								</ItemActions>
							</div>
						</Item>

						<Item variant="outline">
							<ItemContent>
								<ItemTitle>Source Reference</ItemTitle>
								<ItemDescription>{data.doi.ref_title}</ItemDescription>
							</ItemContent>
							<ItemActions>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setSheetOpen(true)}
								>
									Details
								</Button>
							</ItemActions>
						</Item>
					</div>
				</CardContent>
			</Card>
		</TabsContent>
	);
}
