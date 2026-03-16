import { doiGetDois } from "@/api/endpoints/doi/doi.gen";
import type { DOIPublic } from "@/api/model";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Newspaper } from "lucide-react";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/_layout/references")({
  staticData: {
    title: "References",
  },
  component: References,
});

const PAGE_SIZE = 20;

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

function ReferenceItem({ doi }: { doi: DOIPublic }) {
  return (
    <Link to="/references/$id" params={{ id: doi.id }}>
      <div className="group flex flex-col gap-1 py-4 px-4 rounded-lg hover:bg-accent transition-colors border-b last:border-0">
        <p className="font-medium text-sm group-hover:text-primary transition-colors leading-snug">
          {doi.ref_title}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {doi.authors}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {doi.pub_year}
          </Badge>
          <span className="text-xs text-muted-foreground truncate max-w-xs">
            {doi.link}
          </span>
        </div>
      </div>
    </Link>
  );
}

function References() {
  const sentinelRef = useRef<HTMLDivElement>(null);
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

  return (
    <div className="space-y-4 h-full flex flex-col">
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
              <div className="divide-y">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-2 py-4 px-4">
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
              <div className="divide-y">
                {allReferences.map((reference) => (
                  <ReferenceItem key={reference.id} doi={reference} />
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
              </div>
            )}
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}
