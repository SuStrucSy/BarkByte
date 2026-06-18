import { BookOpen } from "lucide-react";
import { useState } from "react";
import type { UseFormSetValue } from "react-hook-form";
import { useDoiGetDois } from "@/api/endpoints/doi/doi";
import type { DOIPublic } from "@/api/model";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@/components/ui/item";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";

type ChooseExistingDOICardProps = {
	formToFill: { setValue: UseFormSetValue<AddNewSpecimenFormValues> };
};

export function ChooseExistingDOICard({
	formToFill,
}: ChooseExistingDOICardProps) {
	const [selectedDoi, setSelectedDoi] = useState<DOIPublic | null>(null);

	const { data: doisData, isLoading: isDoisLoading } = useDoiGetDois();

	const handleDoiSelect = (doi: DOIPublic | null) => {
		setSelectedDoi(doi);

		if (doi) {
			formToFill.setValue("link", doi.link, { shouldValidate: true });
			formToFill.setValue("ref_title", doi.ref_title, { shouldValidate: true });
			formToFill.setValue("authors", doi.authors, { shouldValidate: true });
			formToFill.setValue("pub_year", doi.pub_year, { shouldValidate: true });
			if (doi.id) {
				formToFill.setValue("doi_id", doi.id, { shouldValidate: true });
			}
			return;
		}

		formToFill.setValue("doi_id", undefined);
		formToFill.setValue("link", "");
		formToFill.setValue("ref_title", "");
		formToFill.setValue("authors", "");
		formToFill.setValue("pub_year", new Date().getFullYear());
	};

	const dois: DOIPublic[] = doisData?.data ?? [];

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-base">
					<BookOpen className="h-4 w-4" />
					Use an existing DOI
				</CardTitle>
				<CardDescription>
					Search the database to auto-fill the paper details below, or skip this
					and enter them manually.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Combobox
					items={dois}
					itemToStringValue={(doi: DOIPublic) => doi.id ?? doi.link}
					itemToStringLabel={(doi: DOIPublic) => doi.ref_title}
					onValueChange={(doi: DOIPublic | null) => handleDoiSelect(doi)}
					disabled={isDoisLoading}
				>
					<ComboboxInput
						placeholder={
							isDoisLoading ? "Loading DOIs…" : "Search by title or link…"
						}
						showClear
					/>
					<ComboboxContent>
						<ComboboxEmpty>No matching DOIs found.</ComboboxEmpty>
						<ComboboxList className="outline-black outline-3">
							{(doi) => (
								<ComboboxItem
									key={doi.id}
									value={doi}
									className="min-w-0 overflow-hidden"
								>
									<Item
										size="sm"
										className="min-w-0 flex-nowrap overflow-hidden p-0"
									>
										<ItemContent className="min-w-0 overflow-hidden">
											<ItemTitle className="w-full min-w-0 wrap-break-words">
												{doi.ref_title}
											</ItemTitle>
											<ItemDescription className="w-full min-w-0 wrap-break-words text-left">
												{doi.link}
											</ItemDescription>
										</ItemContent>
									</Item>
								</ComboboxItem>
							)}
						</ComboboxList>
					</ComboboxContent>
				</Combobox>

				{selectedDoi && (
					<p className="mt-2 text-xs text-muted-foreground">
						Fields below have been pre-filled from the selected DOI.
					</p>
				)}
			</CardContent>
		</Card>
	);
}
