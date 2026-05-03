import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { SpecimenPublic } from "@/api/model";
import { CompareSlot } from "@/components/Compare/CompareSlot";
import { CompareStage } from "@/components/Compare/CompareStage";
import { useAllSpecimens } from "@/components/Data-Table/useAllSpecimens";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_layout/compare")({
	staticData: {
		title: "Compare",
	},
	component: ComparePage,
});

const COMPARE_SLOT_COUNT = 3;
const COMPACT_COMPARE_COLUMN_COUNT = 2;

type CompareSlotViewModel = {
	slotIndex: number;
	specimen: SpecimenPublic | null;
	availableSpecimens: SpecimenPublic[];
};

function buildCompareSlots({
	selectedIds,
	visibleSlotCount,
	specimens,
	specimenById,
}: {
	selectedIds: Array<string | null>;
	visibleSlotCount: number;
	specimens: SpecimenPublic[];
	specimenById: Map<string, SpecimenPublic>;
}): CompareSlotViewModel[] {
	const visibleSelectedIds = selectedIds.slice(0, visibleSlotCount);

	return visibleSelectedIds.map((selectedId, slotIndex) => {
		const takenIds = new Set(
			visibleSelectedIds.filter(
				(currentId, currentIndex): currentId is string =>
					Boolean(currentId) && currentIndex !== slotIndex,
			),
		);

		return {
			slotIndex,
			specimen: selectedId ? (specimenById.get(selectedId) ?? null) : null,
			availableSpecimens: specimens.filter(
				(specimen) => !takenIds.has(specimen.id),
			),
		};
	});
}

function ComparePage() {
	const { specimens, isLoading, isError, error } = useAllSpecimens();
	const isCompactCompare = useMediaQuery("(max-width: 1279px)");
	const columnCount = isCompactCompare
		? COMPACT_COMPARE_COLUMN_COUNT
		: COMPARE_SLOT_COUNT;
	const [selectedIds, setSelectedIds] = useState<Array<string | null>>(
		Array.from({ length: COMPARE_SLOT_COUNT }, () => null),
	);
	const visibleSlotCount = columnCount;

	const specimenById = useMemo(
		() => new Map(specimens.map((specimen) => [specimen.id, specimen])),
		[specimens],
	);
	const visibleSlots = useMemo(
		() =>
			buildCompareSlots({
				selectedIds,
				visibleSlotCount,
				specimens,
				specimenById,
			}),
		[selectedIds, specimenById, specimens, visibleSlotCount],
	);

	const chosenSpecimens = useMemo(
		() =>
			selectedIds
				.slice(0, visibleSlotCount)
				.map((id) => (id ? (specimenById.get(id) ?? null) : null)),
		[specimenById, selectedIds, visibleSlotCount],
	);

	const setSelectedSpecimen = (slotIndex: number, specimenId: string) => {
		setSelectedIds((current) =>
			current.map((selectedId, index) =>
				index === slotIndex ? specimenId : selectedId,
			),
		);
	};

	const clearSlot = (slotIndex: number) => {
		setSelectedIds((current) =>
			current.map((selectedId, index) =>
				index === slotIndex ? null : selectedId,
			),
		);
	};

	if (isLoading) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
				Loading specimens for comparison...
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center text-sm text-destructive">
				Failed to load compare data: {error?.message || "Unknown error"}
			</div>
		);
	}

	return (
		<div className="flex min-h-0 flex-col gap-4 p-4 sm:px-2 md:px-4 xl:h-full xl:overflow-hidden">
			<div
				className={cn(
					"grid gap-4",
					columnCount === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3",
				)}
			>
				{visibleSlots.map(({ slotIndex, specimen, availableSpecimens }) => {
					return (
						<div key={`compare-slot-${slotIndex}`} className="min-w-0">
							<CompareSlot
								specimen={specimen}
								availableSpecimens={availableSpecimens}
								onSelect={(specimenId) =>
									setSelectedSpecimen(slotIndex, specimenId)
								}
								onClear={() => clearSlot(slotIndex)}
							/>
						</div>
					);
				})}
			</div>

			<CompareStage
				chosenSpecimens={chosenSpecimens}
				columnCount={columnCount}
			/>
		</div>
	);
}
