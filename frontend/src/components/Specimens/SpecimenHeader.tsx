import { Link } from "@tanstack/react-router";
import { ArrowLeft, Pencil } from "lucide-react";
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
					<Button
						size="icon"
						onClick={onEditClick}
						aria-label="Edit specimen"
						title="Edit specimen"
					>
						<Pencil className="h-4 w-4" />
					</Button>
				) : null}
				{onBackClick ? (
					<Button
						variant="outline"
						size="icon"
						onClick={onBackClick}
						aria-label="Back to specimens"
						title="Back to specimens"
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
				) : (
					<Button
						variant="outline"
						size="icon"
						asChild
						aria-label="Back to specimens"
						title="Back to specimens"
					>
						<Link to="/specimens">
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>
				)}
			</div>
		</div>
	);
}
