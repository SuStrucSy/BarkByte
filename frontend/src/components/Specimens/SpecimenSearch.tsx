import type { SpecimenPublic } from "@/api/model";
import { SpecimenSearchButton } from "@/components/Specimens/SpecimenSearchButton";
import { SpecimenSearchDialog } from "@/components/Specimens/SpecimenSearchDialog";
import { useSpecimenSearchDialog } from "@/components/Specimens/useSpecimenSearchDialog";

interface SpecimenSearchProps {
	specimens: SpecimenPublic[] | undefined;
	onSelect?: (specimen: SpecimenPublic) => void;
	buttonClassName?: string;
	labelClassName?: string;
	shortcutClassName?: string;
}

export default function SpecimenSearch({
	specimens = [],
	onSelect,
	buttonClassName,
	labelClassName,
	shortcutClassName,
}: SpecimenSearchProps) {
	const searchDialog = useSpecimenSearchDialog({
		specimens,
		onSelect,
	});

	return (
		<>
			<SpecimenSearchButton
				onOpen={() => searchDialog.setOpen(true)}
				buttonClassName={buttonClassName}
				labelClassName={labelClassName}
				shortcutClassName={shortcutClassName}
			/>

			<SpecimenSearchDialog {...searchDialog} />
		</>
	);
}
