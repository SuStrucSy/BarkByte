import { ChevronRightIcon, ExternalLinkIcon } from "lucide-react";
import { useDoiGetDoiById } from "@/api/endpoints/doi/doi";
import type {
	DOIDetailPublic,
	DOIPublic,
	Doi,
	SpecimenPublic,
} from "@/api/model";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerTitle,
} from "@/components/ui/drawer";
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
import { useIsMobile } from "@/hooks/use-is-mobile";
import { getSpecimenDisplayLabel, renderValue } from "@/lib/utils";

type SpecimenReferenceSheetProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode?: "doi" | "specimen";
	specimen?: SpecimenPublic | null;
	doi?: Doi | DOIPublic | DOIDetailPublic;
	relatedSpecimens?: SpecimenPublic[];
};

type DetailsTitleProps = {
	children: React.ReactNode;
	isMobile: boolean;
};

function DetailsTitle({ children, isMobile }: DetailsTitleProps) {
	if (isMobile) {
		return (
			<DrawerTitle className="text-xl font-semibold tracking-tight text-foreground">
				{children}
			</DrawerTitle>
		);
	}

	return (
		<SheetTitle className="text-xl font-semibold tracking-tight text-foreground">
			{children}
		</SheetTitle>
	);
}

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
			</ScrollArea>
		</div>
	);
}

function ReferenceDetails({
	doi,
	activeSpecimenId,
	relatedSpecimens = [],
	showRelated = false,
	isMobile,
}: {
	doi: Doi | DOIPublic | DOIDetailPublic;
	activeSpecimenId?: string;
	relatedSpecimens?: SpecimenPublic[];
	showRelated?: boolean;
	isMobile: boolean;
}) {
	const doiId = doi.id ?? "";
	const { data: doiData } = useDoiGetDoiById(doiId, {
		query: {
			enabled: showRelated && !!doiId && relatedSpecimens.length === 0,
		},
	});

	const resolvedRelatedSpecimens =
		relatedSpecimens.length > 0
			? relatedSpecimens
			: (doiData?.specimens?.data ?? []).filter(
					(item) => item.id !== activeSpecimenId,
				);

	return (
		<div className="flex flex-col gap-4">
			<DetailsTitle isMobile={isMobile}>Reference Details</DetailsTitle>

			<p className="text-sm text-muted-foreground">
				This is the original publication containing the written paper and
				research for this specimen data.
			</p>
			<Item variant="outline" asChild>
				<a href={doi.link} target="_blank" rel="noopener noreferrer">
					<ItemContent>
						<ItemTitle>{renderValue(doi.ref_title)}</ItemTitle>
						<ItemDescription>
							{`${renderValue(doi.authors)} • ${renderValue(doi.pub_year)}`}
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
	doi,
	open = false,
	onOpenChange,
	mode = "specimen",
	relatedSpecimens = [],
}: SpecimenReferenceSheetProps) {
	const { isMobile } = useIsMobile();
	const isDoiMode = mode === "doi";
	const resolvedDoi = doi ?? specimen?.doi;

	if (!resolvedDoi || (!isDoiMode && !specimen)) {
		return null;
	}

	const content = (
		<>
			<div className="relative min-h-0 flex-1">
				<ScrollArea className="h-full min-h-0 [&>[data-slot=scroll-area-scrollbar]]:hidden">
					{isDoiMode ? (
						<ReferenceDetails
							doi={resolvedDoi}
							activeSpecimenId={specimen?.id}
							relatedSpecimens={relatedSpecimens}
							showRelated
							isMobile={isMobile}
						/>
					) : (
						<div className="flex flex-col gap-6">
							<div className="flex flex-col gap-4">
								<DetailsTitle isMobile={isMobile}>
									Specimen Details
								</DetailsTitle>
								<dl className="grid gap-3">
									<div className="grid gap-1">
										<dt className="text-xs font-medium text-muted-foreground">
											Reference ID
										</dt>
										<dd className="text-sm">
											{getSpecimenDisplayLabel(specimen)}
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
												{getSpecimenDisplayLabel(specimen)}
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
									doi={resolvedDoi}
									activeSpecimenId={specimen.id}
									relatedSpecimens={relatedSpecimens}
									showRelated
									isMobile={isMobile}
								/>
							</div>
						</div>
					)}
				</ScrollArea>
			</div>
			{isDoiMode ? null : isMobile ? (
				<DrawerFooter className="-mx-6 border-t border-border/70 bg-background px-6">
					<DrawerClose asChild>
						<Button variant="outline">Close</Button>
					</DrawerClose>
				</DrawerFooter>
			) : (
				<SheetFooter className="-mx-6 border-t border-border/70 bg-background px-6">
					<SheetClose asChild>
						<Button variant="outline">Close</Button>
					</SheetClose>
				</SheetFooter>
			)}
		</>
	);

	if (isMobile) {
		return (
			<Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
				<DrawerContent className="mt-24 h-[85vh] max-h-[85vh] px-6 py-6">
					<div className="flex min-h-0 flex-1 flex-col gap-0">{content}</div>
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="flex h-full flex-col gap-0 px-6 py-6">
				{content}
			</SheetContent>
		</Sheet>
	);
}
