import type {
	PendingSpecimenPublicChangedData,
	SpecimenPublic,
} from "@/api/model";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PendingSpecimenChangedOnly } from "./PendingSpecimenDiffTabs";

type PendingSpecimenChangedAttributesCardProps = {
	changedData: PendingSpecimenPublicChangedData;
	isNew: boolean;
	onOpenDetails: () => void;
	originalSpecimen?: SpecimenPublic;
	specimen: Partial<SpecimenPublic>;
};

export function PendingSpecimenChangedAttributesCard({
	changedData,
	isNew,
	onOpenDetails,
	originalSpecimen,
	specimen,
}: PendingSpecimenChangedAttributesCardProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between gap-3">
					<div>
						<CardTitle className="text-base">Changed Attributes</CardTitle>
						<CardDescription>
							A compact review of the submitted changes.
						</CardDescription>
					</div>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={onOpenDetails}
					>
						More Details
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<ScrollArea className="h-72 pr-3">
					<div className="grid gap-3">
						<PendingSpecimenChangedOnly
							changedData={changedData}
							isNew={isNew}
							originalSpecimen={originalSpecimen}
							specimen={specimen}
						/>
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}
