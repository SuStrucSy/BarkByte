import type { ReactNode, RefObject } from "react";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";

interface PendingSpecimenDetailsDrawerProps {
	detailsTabs: ReactNode;
	drawerHeight: number;
	hasSideBySideReviewLayout: boolean;
	onOpenChange: (open: boolean) => void;
	open: boolean;
	reviewPanel: ReactNode;
	sideBySideHeaderRef: RefObject<HTMLDivElement | null>;
	sideBySideRightPaneRef: RefObject<HTMLDivElement | null>;
	title: string;
	usesStackedReviewLayout: boolean;
}

export function PendingSpecimenDetailsDrawer({
	detailsTabs,
	drawerHeight,
	hasSideBySideReviewLayout,
	onOpenChange,
	open,
	reviewPanel,
	sideBySideHeaderRef,
	sideBySideRightPaneRef,
	title,
	usesStackedReviewLayout,
}: PendingSpecimenDetailsDrawerProps) {
	return (
		<Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
			<DrawerContent
				className="flex w-screen max-w-none min-h-[24rem] flex-col"
				style={
					hasSideBySideReviewLayout && drawerHeight > 0
						? {
								height: `${drawerHeight}px`,
								minHeight: `${drawerHeight}px`,
								maxHeight: `${drawerHeight}px`,
							}
						: undefined
				}
			>
				<DrawerHeader ref={sideBySideHeaderRef} className="border-b pb-4">
					<DrawerTitle>{title}</DrawerTitle>
					<DrawerDescription>
						Review complete specimen information, reference details, and
						approval actions.
					</DrawerDescription>
				</DrawerHeader>
				{usesStackedReviewLayout ? (
					<div className="min-h-0 flex-1 overflow-y-auto p-3 [scrollbar-width:none] [-ms-overflow-style:none] sm:p-4 [&::-webkit-scrollbar]:hidden">
						<div className="grid gap-4 pb-4">
							{detailsTabs}
							{reviewPanel}
						</div>
					</div>
				) : (
					<div className="grid gap-4 p-3 pb-4 sm:p-4 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)] lg:items-start lg:gap-6">
						<div className="min-w-0 self-stretch overflow-hidden">
							{detailsTabs}
						</div>
						<div
							ref={sideBySideRightPaneRef}
							className="min-w-0 h-fit self-start"
						>
							{reviewPanel}
						</div>
					</div>
				)}
			</DrawerContent>
		</Drawer>
	);
}
