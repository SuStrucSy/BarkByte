import type { ReactNode } from "react";
import { SpecimenFormNavigation } from "@/components/Specimens/SpecimenFormNavigation";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type MainFormCardProps = {
	currentStep: number;
	stepCount: number;
	title: string;
	description: string;
	progress: number;
	isLastStep: boolean;
	isSubmitting: boolean;
	onBack: () => void;
	onNext: () => void;
	onSubmit: React.SubmitEventHandler<HTMLFormElement>;
	children: ReactNode;
};

export function MainFormCard({
	currentStep,
	stepCount,
	title,
	description,
	progress,
	isLastStep,
	isSubmitting,
	onBack,
	onNext,
	onSubmit,
	children,
}: MainFormCardProps) {
	return (
		<Card>
			<form
				onSubmit={onSubmit}
				onKeyDown={(e) => {
					if (
						e.key === "Enter" &&
						(e.target as HTMLElement).tagName !== "TEXTAREA"
					) {
						e.preventDefault();
					}
				}}
			>
				<CardHeader className="space-y-3">
					<div className="flex items-start justify-between gap-2">
						<div>
							<CardTitle>{title}</CardTitle>
							<CardDescription className="mt-1">{description}</CardDescription>
						</div>
						<Badge variant="secondary" className="shrink-0">
							{currentStep + 1} / {stepCount}
						</Badge>
					</div>
					<Progress value={progress} className="h-1.5 mt-2" />
				</CardHeader>

				<CardContent className="p-6">{children}</CardContent>

				<CardFooter>
					<SpecimenFormNavigation
						currentStep={currentStep}
						isLastStep={isLastStep}
						isSubmitting={isSubmitting}
						onBack={onBack}
						onNext={onNext}
					/>
				</CardFooter>
			</form>
		</Card>
	);
}
