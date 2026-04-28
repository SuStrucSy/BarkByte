import { Children, type ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { PendingSpecimenStackPreview } from "./PendingSpecimenStackPreview";

export type PendingSpecimenStackPreviewEntry = {
	id: string;
	specimenId: string | null;
	stackTitle: string;
	stackSubtitle: string;
	createdAtLabel: string;
};

export type PendingSpecimenStackPreviewData = {
	lead: PendingSpecimenStackPreviewEntry;
	submissions: Array<{
		id: string;
		createdAtLabel: string;
	}>;
};

interface PendingSpecimenStackProps {
	children: ReactNode;
	preview: PendingSpecimenStackPreviewData;
}

export function PendingSpecimenStack({
	children,
	preview,
}: PendingSpecimenStackProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="min-w-0">
			<PendingSpecimenStackPreview
				lead={preview.lead}
				stack={preview.submissions}
				isOpen={isOpen}
				onToggle={() => setIsOpen((current) => !current)}
			/>
			<div
				className={cn(
					"overflow-hidden transition-[max-height,opacity,margin] duration-500 ease-out",
					isOpen ? "mt-4 max-h-[240rem] opacity-100" : "mt-0 max-h-0 opacity-0",
				)}
			>
				<div className="grid gap-4">
					{Children.map(children, (child, index) => (
						<div
							className={cn(
								"min-w-0 transition-[opacity,transform] duration-500 ease-out",
								isOpen
									? "translate-y-0 scale-100 opacity-100"
									: "-translate-y-8 scale-[0.985] opacity-0",
							)}
							style={{
								transitionDelay: isOpen ? `${index * 85}ms` : "0ms",
							}}
						>
							{child}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
