import type { SpecimenPublic } from "@/api/model";
import { Badge } from "@/components/ui/badge";
import { CommandItem } from "@/components/ui/command";

interface SpecimenSearchResultItemProps {
	specimen: SpecimenPublic;
	query: string;
	onSelect: (specimen: SpecimenPublic) => void;
}

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

export function SpecimenSearchResultItem({
	specimen,
	query,
	onSelect,
}: SpecimenSearchResultItemProps) {
	return (
		<CommandItem
			value={specimen.specimen_reference_id}
			onSelect={() => onSelect(specimen)}
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
	);
}
