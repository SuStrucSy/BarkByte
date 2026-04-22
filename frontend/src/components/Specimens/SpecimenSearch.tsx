import { Search } from "lucide-react";
import { matchSorter } from "match-sorter";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SpecimenPublic } from "@/api/model";
import { Badge } from "@/components/ui/badge";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
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
import { Button } from "../ui/button";

interface SpecimenSearchProps {
	specimens: SpecimenPublic[] | undefined;
	onSelect?: (specimen: SpecimenPublic) => void;
	buttonClassName?: string;
	labelClassName?: string;
	shortcutClassName?: string;
}

// --- Sub-components ---

interface HighlightedTextProps {
	text: string;
	query: string;
}

function HighlightedText({ text, query }: HighlightedTextProps) {
	if (!query || !text) return <span>{text}</span>;

	const lower = text.toLowerCase();
	const q = query.toLowerCase();
	const idx = lower.indexOf(q);

	if (idx === -1) return <span>{text}</span>;

	return (
		<span>
			{text.slice(0, idx)}
			<span className="text-primary font-semibold">
				{text.slice(idx, idx + q.length)}
			</span>
			{text.slice(idx + q.length)}
		</span>
	);
}

// --- Main component ---

export default function SpecimenSearch({
	specimens = [],
	onSelect,
	buttonClassName,
	labelClassName,
	shortcutClassName,
}: SpecimenSearchProps) {
	const [open, setOpen] = useState<boolean>(false);
	const [query, setQuery] = useState<string>("");
	const [isMobile, setIsMobile] = useState<boolean>(false);

	// Open with ⌘K / Ctrl+K
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((prev) => !prev);
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const mobileQuery = window.matchMedia("(max-width: 767px)");
		const updateViewportFlags = () => {
			setIsMobile(mobileQuery.matches);
		};

		updateViewportFlags();
		mobileQuery.addEventListener("change", updateViewportFlags);
		return () => {
			mobileQuery.removeEventListener("change", updateViewportFlags);
		};
	}, []);

	const specimenList = useMemo<SpecimenPublic[]>(
		() => Object.values(specimens),
		[specimens],
	);

	const results = useMemo<SpecimenPublic[]>(() => {
		if (!query.trim()) return [];
		return matchSorter(specimenList, query, {
			keys: ["specimen_reference_id"],
		});
	}, [query, specimenList]);

	const handleSelect = useCallback(
		(specimen: SpecimenPublic) => {
			onSelect?.(specimen);
			setOpen(false);
			setQuery("");
		},
		[onSelect],
	);

	const handleOpenChange = useCallback((value: boolean) => {
		setOpen(value);
		if (!value) setQuery("");
	}, []);

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

	const searchContent = (
		<>
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
								<CommandItem
									key={specimen.id}
									value={specimen.specimen_reference_id}
									onSelect={() => handleSelect(specimen)}
									className="flex min-w-0 max-w-full flex-col items-start gap-1 py-2"
								>
									<div className="flex w-full min-w-0 flex-wrap items-start justify-between gap-2">
										<span className="min-w-0 flex-1 break-words font-medium text-sm">
											<HighlightedText
												text={specimen.specimen_reference_id ?? "Unnamed"}
												query={query}
											/>
										</span>
										<div className="flex max-w-full flex-wrap gap-1">
											{specimen.assembly_type && (
												<Badge variant="secondary" className="text-xs">
													{specimen.assembly_type}
												</Badge>
											)}
											{specimen.e_test_loading_type && (
												<Badge variant="outline" className="text-xs">
													{specimen.e_test_loading_type}
												</Badge>
											)}
										</div>
									</div>

									<div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
										{specimen.wood_type && <span>{specimen.wood_type}</span>}
										{specimen.joinery_type?.label && (
											<span>· {specimen.joinery_type.label}</span>
										)}
										{specimen.replicate_tests != null && (
											<span>· {specimen.replicate_tests} replicate(s)</span>
										)}
									</div>
								</CommandItem>
							))}
						</CommandGroup>
					)}
				</CommandList>
			</div>
		</>
	);

	return (
		<>
			<Button
				variant="outline"
				onClick={() => setOpen(true)}
				className={cn(
					"flex max-w-xs items-center gap-2 text-muted-foreground",
					buttonClassName,
				)}
			>
				<Search className="h-4 w-4" />
				<span className={cn(labelClassName)}>Search specimens</span>
				<span className="sr-only">Search specimens</span>
				<kbd
					className={cn(
						"ml-2 pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex",
						shortcutClassName,
					)}
				>
					<span className="text-xs">⌘</span>K
				</kbd>
			</Button>

			<Drawer open={open} onOpenChange={handleOpenChange} direction="top" modal>
				<DrawerContent className={drawerContentClassName}>
					<DrawerHeader className="sr-only">
						<DrawerTitle>Search specimens</DrawerTitle>
						<DrawerDescription>
							Search by specimen reference ID.
						</DrawerDescription>
					</DrawerHeader>
					<Command className={commandSurfaceClassName}>{searchContent}</Command>
				</DrawerContent>
			</Drawer>
		</>
	);
}
