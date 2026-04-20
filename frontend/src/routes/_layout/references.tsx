import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronRightIcon, Newspaper } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { doiGetDois } from "@/api/endpoints/doi/doi";
import type { DOIPublic } from "@/api/model";
import { SpecimenReferenceSheet } from "@/components/Specimens/SpecimenReferenceSheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

export const Route = createFileRoute("/_layout/references")({
	staticData: {
		title: "References",
	},
	component: References,
});

const PAGE_SIZE = 20;

const SKELETON_ROWS = Array.from({ length: 6 }, (_, i) => `skeleton-${i}`);

function useInfiniteDois() {
	return useInfiniteQuery({
		queryKey: ["dois", "infinite"],
		queryFn: ({ pageParam = 0 }) =>
			doiGetDois({ limit: PAGE_SIZE, skip: pageParam }),
		initialPageParam: 0,
		getNextPageParam: (lastPage, pages) =>
			lastPage.data.length === PAGE_SIZE ? pages.length * PAGE_SIZE : undefined,
		staleTime: 5 * 60 * 1000,
	});
}

function ReferenceItem({
	doi,
	onSelect,
}: {
	doi: DOIPublic;
	onSelect: (doi: DOIPublic) => void;
}) {
	return (
		<Item
			variant="outline"
			asChild
			className="group/item rounded-xl border-border/70"
		>
			<button
				type="button"
				onClick={() => onSelect(doi)}
				className="w-full min-w-0 text-left"
			>
				<ItemContent className="min-w-0">
					<ItemTitle className="w-full text-base leading-snug group-hover/item:text-primary">
						<span className="block min-w-0 line-clamp-2 overflow-hidden text-ellipsis">
							{doi.ref_title}
						</span>
					</ItemTitle>
					<div className="flex min-w-0 items-center gap-2 pt-1">
						<ItemDescription className="min-w-0 truncate text-sm">
							{doi.authors}
						</ItemDescription>
						<Badge variant="secondary" className="shrink-0 text-xs">
							{doi.pub_year}
						</Badge>
					</div>
					<div className="hidden min-w-0 items-center gap-2 pt-1 sm:flex">
						<ItemDescription className="min-w-0 truncate text-xs">
							{doi.link}
						</ItemDescription>
					</div>
				</ItemContent>
				<ItemActions className="shrink-0 text-muted-foreground transition-colors group-hover/item:text-primary">
					<ChevronRightIcon className="size-4" />
				</ItemActions>
			</button>
		</Item>
	);
}

function References() {
	const sentinelRef = useRef<HTMLDivElement>(null);
	const [selectedReference, setSelectedReference] = useState<DOIPublic | null>(
		null,
	);
	const [sheetOpen, setSheetOpen] = useState(false);
	const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
		useInfiniteDois();

	const allReferences = data?.pages.flatMap((page) => page.data) ?? [];

	useEffect(() => {
		if (!sentinelRef.current) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ threshold: 0.1 },
		);
		observer.observe(sentinelRef.current);
		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	const handleSelectReference = (doi: DOIPublic) => {
		setSelectedReference(doi);
		setSheetOpen(true);
	};

	return (
		<>
			<div className="flex h-full flex-col space-y-4 px-2 sm:px-2 md:px-4">
				<div>
					<h1 className="text-xl font-semibold">References</h1>
					<p className="text-sm text-muted-foreground">
						{allReferences.length > 0
							? `${allReferences.length} papers loaded`
							: "Browse published papers"}
					</p>
				</div>

				<Card className="flex-1 min-h-0">
					<ScrollArea className="h-full">
						<CardContent className="p-0">
							{isLoading ? (
								<div className="grid gap-3 p-4">
									{SKELETON_ROWS.map((key) => (
										<div
											key={key}
											className="flex flex-col gap-2 rounded-xl border border-border/70 px-4 py-4"
										>
											<Skeleton className="h-4 w-3/4" />
											<Skeleton className="h-3 w-1/2" />
											<Skeleton className="h-3 w-24" />
										</div>
									))}
								</div>
							) : !allReferences.length ? (
								<Empty className="border-none">
									<EmptyHeader>
										<EmptyMedia variant="icon">
											<Newspaper />
										</EmptyMedia>
										<EmptyTitle>No References Found</EmptyTitle>
										<EmptyDescription>
											No references have been added yet.
										</EmptyDescription>
									</EmptyHeader>
								</Empty>
							) : (
								<ItemGroup className="gap-3 p-4">
									{allReferences.map((reference) => (
										<ReferenceItem
											key={reference.id}
											doi={reference}
											onSelect={handleSelectReference}
										/>
									))}
									<div ref={sentinelRef} className="py-4 flex justify-center">
										{isFetchingNextPage ? (
											<Spinner className="h-4 w-4" />
										) : hasNextPage ? (
											<span className="text-xs text-muted-foreground">
												Scroll for more
											</span>
										) : (
											<span className="text-xs text-muted-foreground">
												All {allReferences.length} references loaded
											</span>
										)}
									</div>
								</ItemGroup>
							)}
						</CardContent>
					</ScrollArea>
				</Card>
			</div>
			{selectedReference ? (
				<SpecimenReferenceSheet
					doi={selectedReference}
					mode="doi"
					open={sheetOpen}
					onOpenChange={setSheetOpen}
				/>
			) : null}
		</>
	);
}
