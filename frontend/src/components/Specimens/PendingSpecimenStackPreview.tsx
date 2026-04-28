import { ChevronDown, ChevronRight, Layers } from "lucide-react";
import { useSpecimensReadSpecimen } from "@/api/endpoints/specimens/specimens";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface PendingSpecimenStackPreviewProps {
	lead: {
		id: string;
		specimenId: string | null;
		stackTitle: string;
		stackSubtitle: string;
		createdAtLabel: string;
	};
	stack: Array<{
		id: string;
		createdAtLabel: string;
	}>;
	isOpen: boolean;
	onToggle: () => void;
}

export function PendingSpecimenStackPreview({
	lead,
	stack,
	isOpen,
	onToggle,
}: PendingSpecimenStackPreviewProps) {
	const { data: exactSpecimen } = useSpecimensReadSpecimen(
		lead.specimenId ?? "",
		{
			query: {
				enabled: Boolean(lead.specimenId),
			},
		},
	);

	const resolvedTitle = exactSpecimen?.specimen_reference_id ?? lead.stackTitle;

	return (
		<button
			type="button"
			className="block w-full text-left"
			onClick={onToggle}
			aria-expanded={isOpen}
		>
			<div className="relative pb-4">
				<div className="pointer-events-none absolute inset-x-3 top-2 bottom-0.5 rounded-[1.35rem] border bg-muted/45 shadow-sm" />
				<Card className="relative gap-4 border-border/80 transition-colors hover:border-foreground/20">
					<CardHeader className="pb-0">
						<div className="flex items-start justify-between gap-4">
							<div className="min-w-0 space-y-1">
								<CardDescription className="text-xs uppercase tracking-[0.18em]">
									Specimen Reference
								</CardDescription>
								<CardTitle className="truncate">{resolvedTitle}</CardTitle>
								<CardDescription className="line-clamp-2">
									{lead.stackSubtitle || "Pending specimen updates"}
								</CardDescription>
							</div>
							<div className="flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
								<Layers className="size-4" />
								<span>
									{stack.length} submission{stack.length === 1 ? "" : "s"}
								</span>
								{isOpen ? (
									<ChevronDown className="size-4" />
								) : (
									<ChevronRight className="size-4" />
								)}
							</div>
						</div>
					</CardHeader>
					<CardContent className="grid gap-3">
						<div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
							<span>Latest submission: {lead.createdAtLabel}</span>
							<span className="rounded-full bg-muted px-2 py-0.5 text-xs">
								Click to {isOpen ? "collapse" : "expand"} this stack
							</span>
						</div>
						<div className="grid gap-2">
							{stack.slice(0, Math.min(stack.length, 3)).map((entry, index) => (
								<div
									key={entry.id}
									className="rounded-xl border border-dashed bg-muted/35 px-3 py-2 text-sm text-muted-foreground"
								>
									Revision {stack.length - index} • {entry.createdAtLabel}
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</button>
	);
}
