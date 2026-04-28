import type { ReactNode } from "react";
import { ItemGroup } from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type ScrollableListCardProps = {
	children: ReactNode;
	contentClassName?: string;
	itemGroupClassName?: string;
	scrollAreaClassName?: string;
};

export function ScrollableListCard({
	children,
	itemGroupClassName,
	scrollAreaClassName,
}: ScrollableListCardProps) {
	return (
		<ScrollArea className={cn("m-0 h-full", scrollAreaClassName)}>
			<ItemGroup className={cn("p-4 gap-3", itemGroupClassName)}>
				{children}
			</ItemGroup>
		</ScrollArea>
	);
}
