type SpecimenStep = {
	id: string;
	title: string;
};

type SpecimenStepIndicatorProps = {
	currentStep: number;
	steps: readonly SpecimenStep[];
};

export function SpecimenStepIndicator({
	currentStep,
	steps,
}: SpecimenStepIndicatorProps) {
	return (
		<div className="my-4 flex items-center gap-1 sm:gap-2">
			{steps.map((step, i) => {
				const isCurrent = i === currentStep;
				const isComplete = i < currentStep;

				return (
					<div
						key={step.id}
						className={[
							"flex items-center gap-1 sm:gap-2 min-w-0",
							isCurrent ? "flex-1" : "flex-none sm:flex-1",
						].join(" ")}
					>
						<div
							className={[
								"flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold shrink-0 transition-colors",
								isComplete
									? "bg-primary text-primary-foreground"
									: isCurrent
										? "bg-primary/20 text-primary ring-2 ring-primary"
										: "bg-muted text-muted-foreground",
							].join(" ")}
						>
							{isComplete ? "✓" : i + 1}
						</div>

						<span
							className={[
								"text-xs truncate min-w-0",
								isCurrent
									? "inline text-foreground font-medium"
									: "hidden text-muted-foreground",
								"sm:inline",
							].join(" ")}
						>
							{step.title}
						</span>

						{i < steps.length - 1 && (
							<>
								{i === currentStep && (
									<div className="flex-1 h-px bg-border mx-1 sm:hidden" />
								)}
								<div className="hidden sm:block flex-1 h-px bg-border mx-1" />
							</>
						)}
					</div>
				);
			})}
		</div>
	);
}
