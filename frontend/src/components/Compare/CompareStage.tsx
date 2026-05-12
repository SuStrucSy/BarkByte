import { Columns3 } from "lucide-react";
import { useMemo } from "react";
import type { SpecimenPublic } from "@/api/model";
import { Card, CardContent } from "@/components/ui/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { CompareHeader } from "./CompareHeader";
import { CompareSections } from "./CompareSections";
import { getCompareFields, groupCompareFields } from "./CompareStage.utils";

type CompareStageProps = {
	chosenSpecimens: Array<SpecimenPublic | null>;
	columnCount: number;
};

export function CompareStage({
	chosenSpecimens,
	columnCount,
}: CompareStageProps) {
	const useInternalScroll = useMediaQuery("(min-width: 1280px)");
	const hasSelectedSpecimens = chosenSpecimens.some(Boolean);
	const compareFields = useMemo(() => getCompareFields(), []);
	const compareSections = useMemo(
		() => groupCompareFields(compareFields),
		[compareFields],
	);

	if (!hasSelectedSpecimens) {
		return (
			<Empty className="border xl:min-h-0 xl:flex-1">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Columns3 className="size-5" />
					</EmptyMedia>
					<EmptyTitle>No specimens selected</EmptyTitle>
					<EmptyDescription>
						Add specimens into the slots above to populate the comparison.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	const content = (
		<CompareSections
			sections={compareSections}
			specimens={chosenSpecimens}
			columnCount={columnCount}
		/>
	);

	return (
		<Card className="flex min-w-0 flex-col xl:min-h-0 xl:flex-1 xl:overflow-hidden">
			<CompareHeader />

			<CardContent className="min-w-0 px-0 xl:min-h-0 xl:flex-1">
				{useInternalScroll ? (
					<ScrollArea className="h-full min-w-0 overflow-x-hidden [&>[data-slot=scroll-area-scrollbar][data-orientation=horizontal]]:hidden [&>[data-slot=scroll-area-viewport]]:overflow-x-hidden">
						{content}
					</ScrollArea>
				) : (
					content
				)}
			</CardContent>
		</Card>
	);
}
