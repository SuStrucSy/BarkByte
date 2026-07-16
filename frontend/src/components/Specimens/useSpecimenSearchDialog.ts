import { matchSorter } from "match-sorter";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SpecimenPublic } from "@/api/model";

interface UseSpecimenSearchDialogParams {
	specimens: SpecimenPublic[];
	onSelect?: (specimen: SpecimenPublic) => void;
}

export function useSpecimenSearchDialog({
	specimens,
	onSelect,
}: UseSpecimenSearchDialogParams) {
	const [open, setOpen] = useState<boolean>(false);
	const [query, setQuery] = useState<string>("");
	const [isMobile, setIsMobile] = useState<boolean>(false);

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

	return {
		open,
		query,
		isMobile,
		results,
		setOpen,
		setQuery,
		handleOpenChange,
		handleSelect,
	};
}
