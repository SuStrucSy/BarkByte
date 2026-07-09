import { ExternalLinkIcon } from "lucide-react";
import type { SpecimenPublic } from "@/api/model";
import { DrawerTitle } from "@/components/ui/drawer";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@/components/ui/item";
import { SheetTitle } from "@/components/ui/sheet";
import { getSpecimenDisplayLabel, renderValue } from "@/lib/utils";

type SpecimenDetailsSummaryProps = {
	specimen: SpecimenPublic;
	isMobile: boolean;
};

function SpecimenDetailsTitle({ isMobile }: { isMobile: boolean }) {
	if (isMobile) {
		return (
			<DrawerTitle className="text-xl font-semibold tracking-tight text-foreground">
				Specimen Details
			</DrawerTitle>
		);
	}

	return (
		<SheetTitle className="text-xl font-semibold tracking-tight text-foreground">
			Specimen Details
		</SheetTitle>
	);
}

export function SpecimenDetailsSummary({
	specimen,
	isMobile,
}: SpecimenDetailsSummaryProps) {
	return (
		<div className="flex flex-col gap-4">
			<SpecimenDetailsTitle isMobile={isMobile} />
			<dl className="grid gap-3">
				<div className="grid gap-1">
					<dt className="text-xs font-medium text-muted-foreground">
						Reference ID
					</dt>
					<dd className="text-sm">{getSpecimenDisplayLabel(specimen)}</dd>
				</div>

				<div className="grid gap-1">
					<dt className="text-xs font-medium text-muted-foreground">
						Assembly type
					</dt>
					<dd className="text-sm">{renderValue(specimen.assembly_type)}</dd>
				</div>

				<div className="grid gap-1">
					<dt className="text-xs font-medium text-muted-foreground">
						Joinery type
					</dt>
					<dd className="text-sm">{renderValue(specimen.joinery_type)}</dd>
				</div>

				<div className="grid gap-1">
					<dt className="text-xs font-medium text-muted-foreground">
						Sub joinery type
					</dt>
					<dd className="text-sm">{renderValue(specimen.sub_joinery_type)}</dd>
				</div>

				<div className="grid gap-1">
					<dt className="text-xs font-medium text-muted-foreground">
						Connector
					</dt>
					<dd className="text-sm">{renderValue(specimen.connector)}</dd>
				</div>

				<div className="grid gap-1">
					<dt className="text-xs font-medium text-muted-foreground">Dowel</dt>
					<dd className="text-sm">{renderValue(specimen.dowel)}</dd>
				</div>
			</dl>
			<p className="text-sm text-muted-foreground">
				For more information about this specimen, open the specimen record.
			</p>
			<Item variant="outline" asChild>
				<a
					href={`/specimens/${specimen.id}`}
					target="_blank"
					rel="noopener noreferrer"
				>
					<ItemContent>
						<ItemTitle>Specimen Record</ItemTitle>
						<ItemDescription>
							{getSpecimenDisplayLabel(specimen)}
						</ItemDescription>
					</ItemContent>
					<ItemActions>
						<ExternalLinkIcon className="size-4" />
					</ItemActions>
				</a>
			</Item>
		</div>
	);
}
