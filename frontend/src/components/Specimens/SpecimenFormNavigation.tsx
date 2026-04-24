import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type SubmitButtonProps = {
	disabled: boolean;
};

function SubmitButton({ disabled }: SubmitButtonProps) {
	const justMounted = useRef(true);

	useEffect(() => {
		justMounted.current = false;
	}, []);

	return (
		<Button
			type="submit"
			disabled={disabled}
			onClick={(e) => {
				// Ignore the synthetic click caused when Next is replaced by Submit.
				if (justMounted.current) {
					e.preventDefault();
				}
			}}
		>
			{disabled ? (
				<>
					<Spinner className="h-4 w-4" />
					Submitting…
				</>
			) : (
				"Submit for Review"
			)}
		</Button>
	);
}

type SpecimenFormNavigationProps = {
	currentStep: number;
	isLastStep: boolean;
	isSubmitting: boolean;
	onBack: () => void;
	onNext: () => void;
};

export function SpecimenFormNavigation({
	currentStep,
	isLastStep,
	isSubmitting,
	onBack,
	onNext,
}: SpecimenFormNavigationProps) {
	return (
		<div className="flex justify-between w-full">
			{currentStep > 0 ? (
				<Button type="button" variant="ghost" onClick={onBack}>
					<ChevronLeft className="h-4 w-4" />
					Back
				</Button>
			) : (
				<span />
			)}

			{!isLastStep ? (
				<Button type="button" onClick={onNext}>
					Next
					<ChevronRight className="h-4 w-4" />
				</Button>
			) : (
				<SubmitButton disabled={isSubmitting} />
			)}
		</div>
	);
}
