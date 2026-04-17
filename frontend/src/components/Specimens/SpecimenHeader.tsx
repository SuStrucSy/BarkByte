import { Link } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

type SpecimenHeaderProps = {
	id: string;
	onEditClick?: () => void;
	onBackClick?: () => void;
};

export function SpecimenHeader({
	id,
	onEditClick,
	onBackClick,
}: SpecimenHeaderProps) {
	return (
		<div className="flex items-center justify-between">
			<div>
				<h1 className="text-4xl font-semibold">{id}</h1>
			</div>
			<div className="flex items-center gap-2">
				{onEditClick ? (
					<Button onClick={onEditClick}>
						<Pencil className="h-4 w-4" />
						Edit Specimen
					</Button>
				) : null}
				{onBackClick ? (
					<Button variant="outline" onClick={onBackClick}>
						Back to specimen
					</Button>
				) : (
					<Button variant="outline" asChild>
						<Link to="/specimens">Back to specimens</Link>
					</Button>
				)}
			</div>
		</div>
	);
}
