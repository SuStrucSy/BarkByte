import { X } from "lucide-react";
import type { SpecimenPublic } from "@/api/model";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@/components/ui/combobox";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@/components/ui/item";
import { getSpecimenDisplayLabel } from "@/lib/utils";

type CompareSlotProps = {
	slotIndex: number;
	specimen: SpecimenPublic | null;
	availableSpecimens: SpecimenPublic[];
	onSelect: (slotIndex: number, specimenId: string) => void;
	onClear: (slotIndex: number) => void;
};

export function CompareSlot({
	slotIndex,
	specimen,
	availableSpecimens,
	onSelect,
	onClear,
}: CompareSlotProps) {
	if (specimen) {
		return (
			<Item
				variant="outline"
				className="min-w-0 cursor-pointer hover:border-red-300 hover:bg-red-50 hover:text-red-800"
				role="button"
				tabIndex={0}
				aria-label={`Remove ${getSpecimenDisplayLabel(specimen)}`}
				onClick={() => onClear(slotIndex)}
				onKeyDown={(event) => {
					if (event.key === "Enter" || event.key === " ") {
						event.preventDefault();
						onClear(slotIndex);
					}
				}}
			>
				<ItemContent className="min-w-0">
					<ItemTitle className="group-hover/item:text-red-800">
						{getSpecimenDisplayLabel(specimen)}
					</ItemTitle>
					<ItemDescription className="group-hover/item:text-red-800">
						{specimen.joinery_type.label} / {specimen.sub_joinery_type.label}
					</ItemDescription>
					<ItemDescription className="line-clamp-2 text-xs group-hover/item:text-red-800">
						{specimen.doi.ref_title || "No reference title"}
					</ItemDescription>
				</ItemContent>
				<ItemActions className="text-muted-foreground opacity-100 transition-opacity xl:opacity-0 xl:group-hover/item:opacity-100 group-hover/item:text-red-800">
					<X className="size-4" />
				</ItemActions>
			</Item>
		);
	}

	return (
		<Combobox
			items={availableSpecimens}
			itemToStringValue={(item: SpecimenPublic) => item.id}
			itemToStringLabel={(item: SpecimenPublic) =>
				`${getSpecimenDisplayLabel(item)} ${item.joinery_type.label} ${item.sub_joinery_type.label} ${item.doi.ref_title ?? ""} ${item.doi.authors ?? ""}`
			}
			onValueChange={(item: SpecimenPublic | null) => {
				if (item) {
					onSelect(slotIndex, item.id);
				}
			}}
		>
			<ComboboxInput
				placeholder="Search by ID, joinery, or reference"
				showClear
			/>
			<ComboboxContent>
				<ComboboxEmpty>No matching specimens.</ComboboxEmpty>
				<ComboboxList>
					{(candidate: SpecimenPublic) => (
						<ComboboxItem key={candidate.id} value={candidate}>
							<div className="min-w-0">
								<div className="font-medium">
									{getSpecimenDisplayLabel(candidate)}
								</div>
								<div className="text-muted-foreground line-clamp-1 text-xs">
									{candidate.joinery_type.label} /{" "}
									{candidate.sub_joinery_type.label}
								</div>
							</div>
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	);
}
