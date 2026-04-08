import { ChevronRightIcon, ExternalLinkIcon } from "lucide-react";
import { useDoiGetDoiById } from "@/api/endpoints/doi/doi";
import type { SpecimenPublic } from "@/api/model";
import { Button } from "@/components/ui/button";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetFooter,
	SheetTitle,
} from "@/components/ui/sheet";
import { renderValue } from "@/lib/utils";

type SpecimenReferenceSheetProps = {
	specimen: SpecimenPublic;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode?: "doi" | "specimen";
	relatedSpecimens?: SpecimenPublic[];
};

function showRelatedSpecimens(relatedSpecimens: SpecimenPublic[]) {
	if (!relatedSpecimens || relatedSpecimens.length === 0) {
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
			<ScrollArea className="max-h-64">
				<div className="grid gap-2">
					{relatedSpecimens.map((specimen) => (
						<Item key={specimen.id} variant="outline" asChild>
							<a
								href={`/specimens/${specimen.id}`}
								target="_blank"
								rel="noreferrer"
							>
								<ItemContent>
									<ItemTitle>
										{specimen.specimen_reference_id ?? specimen.id}
									</ItemTitle>
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
			</ScrollArea>
		</div>
	);
}

function ReferenceDetails({
	specimen,
	relatedSpecimens = [],
	showRelated = false,
}: {
	specimen: SpecimenPublic;
	relatedSpecimens?: SpecimenPublic[];
	showRelated?: boolean;
}) {
	const doiId = specimen.doi.id ?? "";
	const { data: doiData } = useDoiGetDoiById(doiId, {
		query: {
			enabled: showRelated && !!doiId && relatedSpecimens.length === 0,
		},
	});

	const resolvedRelatedSpecimens =
		relatedSpecimens.length > 0
			? relatedSpecimens
			: (doiData?.specimens?.data ?? []).filter(
					(item) => item.id !== specimen.id,
				);

	return (
		<div className="flex flex-col gap-4">
			<SheetTitle className="text-xl font-semibold tracking-tight text-foreground">
				Reference Details
			</SheetTitle>

			<p className="text-sm text-muted-foreground">
				This is the original publication containing the written paper and
				research for this specimen data.
			</p>
			<Item variant="outline" asChild>
				<a href={specimen.doi.link} target="_blank" rel="noopener noreferrer">
					<ItemContent>
						<ItemTitle>{renderValue(specimen.doi.ref_title)}</ItemTitle>
						<ItemDescription>
							{`${renderValue(specimen.doi.authors)} • ${renderValue(specimen.doi.pub_year)}`}
						</ItemDescription>
					</ItemContent>
					<ItemActions>
						<ExternalLinkIcon className="size-4" />
					</ItemActions>
				</a>
			</Item>
			{showRelated ? showRelatedSpecimens(resolvedRelatedSpecimens) : null}
		</div>
	);
}

export function SpecimenReferenceSheet({
	specimen,
	open = false,
	onOpenChange,
	mode = "specimen",
	relatedSpecimens = [],
}: SpecimenReferenceSheetProps) {
	const isDoiMode = mode === "doi";

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="flex h-full flex-col px-6 py-6">
				<ScrollArea className="min-h-0 flex-1 pr-2">
					{isDoiMode ? (
						<ReferenceDetails
							specimen={specimen}
							relatedSpecimens={relatedSpecimens}
							showRelated
						/>
					) : (
						<div className="flex flex-col gap-6">
							<div className="flex flex-col gap-4">
								<SheetTitle className="text-xl font-semibold tracking-tight text-foreground">
									Specimen Details
								</SheetTitle>
								<dl className="grid gap-3">
									<div className="grid gap-1">
										<dt className="text-xs font-medium text-muted-foreground">
											Reference ID
										</dt>
										<dd className="text-sm">
											{renderValue(
												specimen.specimen_reference_id ?? specimen.id,
											)}
										</dd>
									</div>

									<div className="grid gap-1">
										<dt className="text-xs font-medium text-muted-foreground">
											Assembly type
										</dt>
										<dd className="text-sm">
											{renderValue(specimen.assembly_type)}
										</dd>
									</div>

									<div className="grid gap-1">
										<dt className="text-xs font-medium text-muted-foreground">
											Joinery type
										</dt>
										<dd className="text-sm">
											{renderValue(specimen.joinery_type)}
										</dd>
									</div>

									<div className="grid gap-1">
										<dt className="text-xs font-medium text-muted-foreground">
											Sub joinery type
										</dt>
										<dd className="text-sm">
											{renderValue(specimen.sub_joinery_type)}
										</dd>
									</div>

									<div className="grid gap-1">
										<dt className="text-xs font-medium text-muted-foreground">
											Connector
										</dt>
										<dd className="text-sm">
											{renderValue(specimen.connector)}
										</dd>
									</div>

									<div className="grid gap-1">
										<dt className="text-xs font-medium text-muted-foreground">
											Dowel
										</dt>
										<dd className="text-sm">{renderValue(specimen.dowel)}</dd>
									</div>
								</dl>
								<p className="text-sm text-muted-foreground">
									For more information about this specimen, open the specimen
									record.
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
												{renderValue(
													specimen.specimen_reference_id ?? specimen.id,
												)}
											</ItemDescription>
										</ItemContent>
										<ItemActions>
											<ExternalLinkIcon className="size-4" />
										</ItemActions>
									</a>
								</Item>
							</div>

							<div className="border-t pt-6">
								<ReferenceDetails
									specimen={specimen}
									relatedSpecimens={relatedSpecimens}
									showRelated
								/>
							</div>
						</div>
					)}
				</ScrollArea>
				<SheetFooter>
					<SheetClose asChild>
						<Button variant="outline">Close</Button>
					</SheetClose>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
