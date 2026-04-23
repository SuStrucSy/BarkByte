import type { ReactNode } from "react";
import { CardContent } from "@/components/ui/card";
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
	contentClassName,
	itemGroupClassName,
	scrollAreaClassName,
}: ScrollableListCardProps) {
	return (
		<ScrollArea className={cn("m-0 h-full", scrollAreaClassName)}>
			<CardContent className={cn("p-0 p-4", contentClassName)}>
				<ItemGroup className={cn("gap-3", itemGroupClassName)}>
					{children}
				</ItemGroup>
			</CardContent>
		</ScrollArea>
	);
}
