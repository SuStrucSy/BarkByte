import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { specimenFormSteps } from "@/components/Specimens/specimenFormSteps";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";

export function useSpecimenStepNavigation(
	form: UseFormReturn<AddNewSpecimenFormValues>,
) {
	const [currentStep, setCurrentStep] = useState(0);

	const currentStepConfig = specimenFormSteps[currentStep];
	const isLastStep = currentStep === specimenFormSteps.length - 1;
	const progress = ((currentStep + 1) / specimenFormSteps.length) * 100;

	const goNext = async () => {
		const isValid = await form.trigger(currentStepConfig.fields);
		if (isValid) {
			setCurrentStep((prev) => prev + 1);
		}
	};

	const goBack = () => {
		if (currentStep > 0) {
			setCurrentStep((prev) => prev - 1);
		}
	};

	const resetStepNavigation = () => {
		setCurrentStep(0);
	};

	return {
		currentStep,
		currentStepConfig,
		goBack,
		goNext,
		isLastStep,
		progress,
		resetStepNavigation,
		stepCount: specimenFormSteps.length,
		steps: specimenFormSteps,
	};
}
