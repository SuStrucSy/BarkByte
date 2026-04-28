import { ChevronRightIcon } from "lucide-react";
import { ScrollableListCard } from "@/components/Common/ScrollableListCard";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_ROWS = [
	"specimen-mobile-sk-1",
	"specimen-mobile-sk-2",
	"specimen-mobile-sk-3",
	"specimen-mobile-sk-4",
];

export default function SkeletonSpecimensList() {
	return (
		<ScrollableListCard
			itemGroupClassName="min-h-0 flex-1"
			scrollAreaClassName="h-full"
		>
			{SKELETON_ROWS.map((id) => (
				<Item key={id} variant="outline" className="rounded-xl">
					<ItemContent>
						<ItemTitle>
							<Skeleton className="h-4 w-40" />
						</ItemTitle>

						<Skeleton className="h-3 w-52" />

						<Skeleton className="h-3 w-28" />
					</ItemContent>
					<ItemActions>
						<ChevronRightIcon className="text-muted-foreground" />
					</ItemActions>
				</Item>
			))}
			<div className="pt-2">
				<Skeleton className="h-10 w-full rounded-xl" />
			</div>
		</ScrollableListCard>
	);
}
