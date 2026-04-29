import type { ReactNode } from "react";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";

interface PendingSpecimenDetailsDrawerProps {
	detailsTabs: ReactNode;
	onOpenChange: (open: boolean) => void;
	open: boolean;
	reviewPanel: ReactNode;
	title: string;
}

export function PendingSpecimenDetailsDrawer({
	detailsTabs,
	onOpenChange,
	open,
	reviewPanel,
	title,
}: PendingSpecimenDetailsDrawerProps) {
	return (
		<Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
			<DrawerContent className="flex w-screen max-w-none min-h-96 flex-col">
				<DrawerHeader className="border-b pb-4">
					<DrawerTitle>{title}</DrawerTitle>
					<DrawerDescription>
						Review complete specimen information, reference details, and
						approval actions.
					</DrawerDescription>
				</DrawerHeader>

				<div className="grid gap-4 p-3 pb-4 sm:p-4 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)] lg:items-start lg:gap-6 overflow-y-auto no-scrollbar">
					<div className="min-w-0 h-fit self-stretch">{detailsTabs}</div>
					<div className="min-w-0 h-fit self-start">{reviewPanel}</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
