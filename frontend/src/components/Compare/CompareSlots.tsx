import type { SpecimenPublic } from "@/api/model";
import { CompareSlot } from "./CompareSlot";
import { getCompareGridColumnsClass } from "./compareLayout";

export type CompareSlotViewModel = {
	slotIndex: number;
	specimen: SpecimenPublic | null;
	availableSpecimens: SpecimenPublic[];
};

type CompareSlotsProps = {
	slots: CompareSlotViewModel[];
	columnCount: number;
	onSelectSpecimen: (slotIndex: number, specimenId: string) => void;
	onClearSlot: (slotIndex: number) => void;
};

export function CompareSlots({
	slots,
	columnCount,
	onSelectSpecimen,
	onClearSlot,
}: CompareSlotsProps) {
	return (
		<div className={`grid gap-4 ${getCompareGridColumnsClass(columnCount)}`}>
			{slots.map(({ slotIndex, specimen, availableSpecimens }) => (
				<CompareSlot
					key={`compare-slot-${slotIndex}`}
					specimen={specimen}
					availableSpecimens={availableSpecimens}
					onSelect={(specimenId) => onSelectSpecimen(slotIndex, specimenId)}
					onClear={() => onClearSlot(slotIndex)}
				/>
			))}
		</div>
	);
}
