import { useState } from "react";
import type { UseFormTrigger } from "react-hook-form";
import {
	getSpecimenFormSteps,
	type SpecimenFormStepMode,
} from "@/components/Specimens/specimenFormSteps";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";

export function useSpecimenStepNavigation(
	form: { trigger: UseFormTrigger<AddNewSpecimenFormValues> },
	{ mode }: { mode: SpecimenFormStepMode },
) {
	const [currentStep, setCurrentStep] = useState(0);

	const steps = getSpecimenFormSteps(mode);
	const currentStepConfig = steps[currentStep];
	const isLastStep = currentStep === steps.length - 1;
	const progress = ((currentStep + 1) / steps.length) * 100;

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
		stepCount: steps.length,
		steps,
	};
}

export type SpecimenStepNavigation = ReturnType<
	typeof useSpecimenStepNavigation
>;
