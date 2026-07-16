import type { SpecimenPublic } from "@/api/model";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandList,
} from "@/components/ui/command";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { SpecimenSearchResultItem } from "./SpecimenSearchResultItem";

interface SpecimenSearchDialogProps {
	open: boolean;
	query: string;
	isMobile: boolean;
	results: SpecimenPublic[];
	setQuery: (query: string) => void;
	handleOpenChange: (open: boolean) => void;
	handleSelect: (specimen: SpecimenPublic) => void;
}

export function SpecimenSearchDialog({
	open,
	query,
	isMobile,
	results,
	setQuery,
	handleOpenChange,
	handleSelect,
}: SpecimenSearchDialogProps) {
	const commandSurfaceClassName = cn(
		"flex w-full min-w-0 max-w-full flex-col rounded-none",
		isMobile ? "h-[75dvh]" : "h-[60dvh]",
	);
	const drawerContentClassName = cn(
		"overflow-hidden p-0",
		isMobile
			? "h-[75dvh]"
			: "mt-8 h-[60dvh] md:!inset-x-auto md:!left-1/2 md:!right-auto md:top-[20dvh] md:mb-0 md:w-[min(calc(100vw-2rem),42rem)] md:max-w-none md:-translate-x-1/2 md:rounded-lg md:border",
	);

	return (
		<Drawer open={open} onOpenChange={handleOpenChange} direction="top" modal>
			<DrawerContent className={drawerContentClassName}>
				<DrawerHeader className="sr-only">
					<DrawerTitle>Search specimens</DrawerTitle>
					<DrawerDescription>
						Search by specimen reference ID.
					</DrawerDescription>
				</DrawerHeader>
				<Command className={commandSurfaceClassName}>
					<CommandInput
						placeholder="Search by specimen reference ID"
						value={query}
						onValueChange={setQuery}
					/>
					<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y">
						<CommandList className="max-w-full">
							<CommandEmpty>No specimens found.</CommandEmpty>

							{results.length > 0 && (
								<CommandGroup heading={`${results.length} specimen(s)`}>
									{results.map((specimen) => (
										<SpecimenSearchResultItem
											key={specimen.id}
											specimen={specimen}
											query={query}
											onSelect={handleSelect}
										/>
									))}
								</CommandGroup>
							)}
						</CommandList>
					</div>
				</Command>
			</DrawerContent>
		</Drawer>
	);
}
