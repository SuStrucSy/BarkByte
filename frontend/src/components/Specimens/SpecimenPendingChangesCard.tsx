import type { ReactNode } from "react";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";

type SpecimenPendingChangesCardProps = {
	changedFields: Array<keyof AddNewSpecimenFormValues>;
	getFieldLabel: (field: keyof AddNewSpecimenFormValues) => string;
	renderOriginalValue: (field: keyof AddNewSpecimenFormValues) => ReactNode;
	renderCurrentValue: (field: keyof AddNewSpecimenFormValues) => ReactNode;
};

export function SpecimenPendingChangesCard({
	changedFields,
	getFieldLabel,
	renderOriginalValue,
	renderCurrentValue,
}: SpecimenPendingChangesCardProps) {
	const hasChanges = changedFields.length > 0;

	return (
		<Card className={hasChanges ? "" : "border-dashed"}>
			<CardHeader>
				<CardTitle className="text-base">
					{hasChanges ? "Pending Changes" : "No pending changes"}
				</CardTitle>
				<CardDescription>
					{hasChanges
						? "Review the before and after values before you submit."
						: "Update one or more fields before submitting for review."}
				</CardDescription>
			</CardHeader>
			{hasChanges ? (
				<CardContent className="grid gap-3">
					{changedFields.map((field) => (
						<div key={field} className="grid gap-1 rounded-md border px-3 py-2">
							<span className="text-[10px] tracking-wide text-muted-foreground uppercase">
								{getFieldLabel(field)}
							</span>
							<div className="text-sm text-red-600 line-through decoration-red-400">
								{renderOriginalValue(field)}
							</div>
							<div className="text-sm text-green-700 dark:text-green-400">
								{renderCurrentValue(field)}
							</div>
						</div>
					))}
				</CardContent>
			) : null}
		</Card>
	);
}
