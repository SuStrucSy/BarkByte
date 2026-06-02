import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ReferenceSectionProps = {
	title: string;
	isLoading: boolean;
	isEmpty: boolean;
	onAdd: () => void;
	children: ReactNode;
};

export function ReferenceSection({
	title,
	isLoading,
	isEmpty,
	onAdd,
	children,
}: ReferenceSectionProps) {
	return (
		<Card>
			<CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<CardTitle>{title}</CardTitle>
				<Button type="button" className="mb-2" onClick={onAdd}>
					<Plus className="size-4" />
					Add
				</Button>
			</CardHeader>
			<CardContent className="space-y-3">
				{isLoading ? (
					<div className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
						Loading…
					</div>
				) : isEmpty ? (
					<div className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
						No items yet.
					</div>
				) : (
					children
				)}
			</CardContent>
		</Card>
	);
}
