import { ExternalLinkIcon } from "lucide-react";
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
import { renderValue } from "@/lib/utils";
import { RelatedSpecimenList } from "./RelatedSpecimenList";
import { SpecimenDetailsSummary } from "./SpecimenDetailsSummary";

type SpecimenReferenceSheetProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode?: "doi" | "specimen";
	specimen?: SpecimenPublic | null;
	doi?: Doi | DOIPublic | DOIDetailPublic;
	relatedSpecimens?: SpecimenPublic[];
};

type ReferenceDoi = Doi | DOIPublic | DOIDetailPublic;

type DetailsTitleProps = {
	children: React.ReactNode;
	isMobile: boolean;
};

type ResponsiveReferenceSurfaceProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isMobile: boolean;
	children: React.ReactNode;
};

type ReferenceDetailsProps = {
	doi: ReferenceDoi;
	activeSpecimenId?: string;
	relatedSpecimens?: SpecimenPublic[];
	showRelated?: boolean;
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

function ResponsiveReferenceSurface({
	open,
	onOpenChange,
	isMobile,
	children,
}: ResponsiveReferenceSurfaceProps) {
	if (isMobile) {
		return (
			<Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
				<DrawerContent className="mt-24 h-[85vh] max-h-[85vh] px-6 py-6">
					<div className="flex min-h-0 flex-1 flex-col gap-0">{children}</div>
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="flex h-full flex-col gap-0 px-6 py-6">
				{children}
			</SheetContent>
		</Sheet>
	);
}

function useResolvedReferenceDetails({
	doi,
	activeSpecimenId,
	relatedSpecimens = [],
	showRelated = false,
}: Omit<ReferenceDetailsProps, "isMobile">) {
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

	return { resolvedRelatedSpecimens };
}

function ReferenceDetails(props: ReferenceDetailsProps) {
	const {
		doi,
		activeSpecimenId,
		relatedSpecimens = [],
		showRelated = false,
		isMobile,
	} = props;
	const { resolvedRelatedSpecimens } = useResolvedReferenceDetails({
		doi,
		activeSpecimenId,
		relatedSpecimens,
		showRelated,
	});

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
			{showRelated ? (
				<RelatedSpecimenList relatedSpecimens={resolvedRelatedSpecimens} />
			) : null}
		</div>
	);
}

function SpecimenReferenceContent({
	mode,
	specimen,
	doi,
	relatedSpecimens = [],
	isMobile,
}: {
	mode: "doi" | "specimen";
	specimen?: SpecimenPublic | null;
	doi: ReferenceDoi;
	relatedSpecimens?: SpecimenPublic[];
	isMobile: boolean;
}) {
	const isDoiMode = mode === "doi";

	return (
		<>
			<div className="relative min-h-0 flex-1">
				<ScrollArea className="h-full min-h-0 [&>[data-slot=scroll-area-scrollbar]]:hidden">
					{isDoiMode ? (
						<ReferenceDetails
							doi={doi}
							activeSpecimenId={specimen?.id}
							relatedSpecimens={relatedSpecimens}
							showRelated
							isMobile={isMobile}
						/>
					) : specimen ? (
						<div className="flex flex-col gap-6">
							<SpecimenDetailsSummary specimen={specimen} isMobile={isMobile} />

							<div className="border-t pt-6">
								<ReferenceDetails
									doi={doi}
									activeSpecimenId={specimen.id}
									relatedSpecimens={relatedSpecimens}
									showRelated
									isMobile={isMobile}
								/>
							</div>
						</div>
					) : null}
				</ScrollArea>
			</div>
			<ReferenceSurfaceFooter isMobile={isMobile} />
		</>
	);
}

function ReferenceSurfaceFooter({ isMobile }: { isMobile: boolean }) {
	if (isMobile) {
		return (
			<DrawerFooter className="-mx-6 border-t border-border/70 bg-background px-6">
				<DrawerClose asChild>
					<Button variant="outline">Close</Button>
				</DrawerClose>
			</DrawerFooter>
		);
	}

	return (
		<SheetFooter className="-mx-6 border-t border-border/70 bg-background px-6">
			<SheetClose asChild>
				<Button variant="outline">Close</Button>
			</SheetClose>
		</SheetFooter>
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

	return (
		<ResponsiveReferenceSurface
			open={open}
			onOpenChange={onOpenChange}
			isMobile={isMobile}
		>
			<SpecimenReferenceContent
				mode={mode}
				specimen={specimen}
				doi={resolvedDoi}
				relatedSpecimens={relatedSpecimens}
				isMobile={isMobile}
			/>
		</ResponsiveReferenceSurface>
	);
}
