import { Link } from "@tanstack/react-router";
import { ExternalLinkIcon } from "lucide-react";
import type { SpecimenPublic } from "@/api/model";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@/components/ui/item";
import { renderValue } from "@/lib/utils";

interface PendingSpecimenDetailsLinksProps {
	originalSpecimen?: SpecimenPublic;
	specimen: Partial<SpecimenPublic>;
	specimenId: string | null;
}

const truncateText = (value: string | null | undefined, maxLength: number) => {
	if (!value) return value;
	return value.length > maxLength
		? `${value.slice(0, maxLength).trimEnd()}...`
		: value;
};

export function PendingSpecimenDetailsLinks({
	originalSpecimen,
	specimen,
	specimenId,
}: PendingSpecimenDetailsLinksProps) {
	const doi = specimen.doi ?? originalSpecimen?.doi;

	if (!doi && !specimenId) {
		return (
			<div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
				Details are unavailable for this pending specimen.
			</div>
		);
	}

	return (
		<div className="grid gap-3">
			{specimenId ? (
				<Item variant="outline" asChild>
					<Link
						to="/specimens/$specimenId"
						params={{ specimenId }}
						target="_blank"
					>
						<ItemContent>
							<ItemTitle>Specimen Record</ItemTitle>
							<ItemDescription>
								{[
									specimen.specimen_reference_id ??
										originalSpecimen?.specimen_reference_id ??
										specimenId,
									renderValue(
										specimen.assembly_type ?? originalSpecimen?.assembly_type,
									),
									renderValue(
										specimen.joinery_type?.label ??
											originalSpecimen?.joinery_type?.label,
									),
								].join(" • ")}
							</ItemDescription>
						</ItemContent>
						<ItemActions>
							<ExternalLinkIcon className="size-4" />
						</ItemActions>
					</Link>
				</Item>
			) : null}
			{doi ? (
				<Item variant="outline" asChild>
					<a href={doi.link} target="_blank" rel="noopener noreferrer">
						<ItemContent>
							<ItemTitle className="w-full">
								<span className="line-clamp-3">
									{truncateText(doi.ref_title, 120)}
								</span>
							</ItemTitle>
							<ItemDescription className="line-clamp-1">
								{truncateText(doi.authors, 64)} • {doi.pub_year}
							</ItemDescription>
						</ItemContent>
						<ItemActions>
							<ExternalLinkIcon className="size-4" />
						</ItemActions>
					</a>
				</Item>
			) : null}
		</div>
	);
}
