import { Link } from "@tanstack/react-router";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

type SpecimenHeaderProps = {
	title: string;
	onEditClick?: () => void;
	onBackClick?: () => void;
};

export function SpecimenHeader({
	title,
	onEditClick,
	onBackClick,
}: SpecimenHeaderProps) {
	const backButton = onBackClick ? (
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
	);

	return (
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-3">
				{backButton}
				<h1 className="text-4xl font-semibold">{title}</h1>
			</div>
			<div className="flex items-center gap-2">
				{onEditClick ? (
					<Button
						size="sm"
						onClick={onEditClick}
						aria-label="Edit specimen"
						title="Edit specimen"
						className="gap-2"
					>
						<Pencil className="h-4 w-4" />
						<span className="hidden sm:inline">Edit Specimen</span>
					</Button>
				) : null}
			</div>
		</div>
	);
}
