import type { ReactNode } from "react";
import { SpecimenFormNavigation } from "@/components/Specimens/SpecimenFormNavigation";
import { SpecimenStepIndicator } from "@/components/Specimens/SpecimenStepIndicator";
import type { SpecimenStepNavigation } from "@/components/Specimens/useSpecimenStepNavigation";
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

type SpecimenStepFormCardProps = {
	stepNavigation: SpecimenStepNavigation;
	isSubmitting: boolean;
	onSubmit: React.SubmitEventHandler<HTMLFormElement>;
	children: ReactNode;
};

export function SpecimenStepFormCard({
	stepNavigation,
	isSubmitting,
	onSubmit,
	children,
}: SpecimenStepFormCardProps) {
	const {
		currentStep,
		currentStepConfig,
		goBack,
		goNext,
		isLastStep,
		progress,
		stepCount,
		steps,
	} = stepNavigation;

	return (
		<>
			<SpecimenStepIndicator currentStep={currentStep} steps={steps} />

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
								<CardTitle>{currentStepConfig.title}</CardTitle>
								<CardDescription className="mt-1">
									{currentStepConfig.description}
								</CardDescription>
							</div>
							<Badge variant="secondary" className="shrink-0">
								{currentStep + 1} / {stepCount}
							</Badge>
						</div>
						<Progress value={progress} className="mt-2 h-1.5" />
					</CardHeader>

					<CardContent className="p-6">{children}</CardContent>

					<CardFooter>
						<SpecimenFormNavigation
							currentStep={currentStep}
							isLastStep={isLastStep}
							isSubmitting={isSubmitting}
							onBack={goBack}
							onNext={goNext}
						/>
					</CardFooter>
				</form>
			</Card>
		</>
	);
}
