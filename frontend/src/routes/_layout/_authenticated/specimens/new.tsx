import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { ChooseExistingDOICard } from "@/components/Specimens/ChooseExistingDOICard";
import { MainFormCard } from "@/components/Specimens/MainFormCard";
import { SpecimenStepIndicator } from "@/components/Specimens/SpecimenStepIndicator";
import { getEmptySpecimenFormValues } from "@/components/Specimens/specimenForm.utils";
import { useCreateSpecimenSubmit } from "@/components/Specimens/useCreateSpecimenSubmit";
import { useSpecimenStepNavigation } from "@/components/Specimens/useSpecimenStepNavigation";
import {
	type AddNewSpecimenFormValues,
	AddNewSpecimenSchema,
} from "@/lib/schemas";

export const Route = createFileRoute("/_layout/_authenticated/specimens/new")({
	staticData: {
		title: "Add Specimen",
	},
	component: CreateSpecimenPage,
});

function CreateSpecimenPage() {
	const form = useForm<AddNewSpecimenFormValues>({
		resolver: zodResolver(AddNewSpecimenSchema),
		defaultValues: getEmptySpecimenFormValues(),
		mode: "onChange",
	});
	const hasExistingDoi = Boolean(form.watch("doi_id"));
	const {
		currentStep,
		currentStepConfig,
		goBack,
		goNext,
		isLastStep,
		progress,
		resetStepNavigation,
		stepCount,
		steps,
	} = useSpecimenStepNavigation(form);

	const { onSubmit } = useCreateSpecimenSubmit({
		form,
		resetStepNavigation,
	});

	return (
		<div className="mx-auto w-full max-w-6xl space-y-4 px-4 sm:px-6">
			{currentStep === 0 && <ChooseExistingDOICard formToFill={form} />}

			<SpecimenStepIndicator currentStep={currentStep} steps={steps} />

			<MainFormCard
				currentStep={currentStep}
				stepCount={stepCount}
				title={currentStepConfig.title}
				description={currentStepConfig.description}
				progress={progress}
				isLastStep={isLastStep}
				isSubmitting={form.formState.isSubmitting}
				onBack={goBack}
				onNext={goNext}
				onSubmit={form.handleSubmit(onSubmit)}
			>
				{currentStepConfig.render({
					control: form.control,
					hasExistingDoi,
				})}
			</MainFormCard>
		</div>
	);
}
