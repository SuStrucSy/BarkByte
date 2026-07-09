import { ChevronRightIcon } from "lucide-react";
import type { SpecimenPublic } from "@/api/model";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@/components/ui/item";
import { getSpecimenDisplayLabel, renderValue } from "@/lib/utils";

type RelatedSpecimenListProps = {
	relatedSpecimens: SpecimenPublic[];
};

export function RelatedSpecimenList({
	relatedSpecimens,
}: RelatedSpecimenListProps) {
	if (relatedSpecimens.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-col gap-2">
			<h4 className="pt-2 text-base font-semibold tracking-tight text-foreground">
				Publication Specimens
			</h4>
			<p className="text-sm text-muted-foreground">
				These are the other specimens found in this reference paper.
			</p>
			<div className="grid gap-2">
				{relatedSpecimens.map((specimen) => (
					<Item key={specimen.id} variant="outline" asChild>
						<a
							href={`/specimens/${specimen.id}`}
							target="_blank"
							rel="noreferrer"
						>
							<ItemContent>
								<ItemTitle>{getSpecimenDisplayLabel(specimen)}</ItemTitle>
								<ItemDescription>
									{renderValue(
										specimen.joinery_type?.label ?? specimen.joinery_type,
									)}
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
	);
}
