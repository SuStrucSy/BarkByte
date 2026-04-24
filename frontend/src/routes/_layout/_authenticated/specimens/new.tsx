import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useDoiCreateDoi } from "@/api/endpoints/doi/doi";
import { useSpecimensCreateSpecimen } from "@/api/endpoints/specimens/specimens";
import type { HTTPValidationError } from "@/api/model";
import { ChooseExistingDOICard } from "@/components/Specimens/ChooseExistingDOICard";
import { MainFormCard } from "@/components/Specimens/MainFormCard";
import { SpecimenStepIndicator } from "@/components/Specimens/SpecimenStepIndicator";
import { getEmptySpecimenFormValues } from "@/components/Specimens/specimenForm.utils";
import { useSpecimenStepNavigation } from "@/components/Specimens/useSpecimenStepNavigation";
import {
	type AddNewSpecimenFormValues,
	AddNewSpecimenSchema,
} from "@/lib/schemas";
import { handleError } from "@/lib/utils";

export const Route = createFileRoute("/_layout/_authenticated/specimens/new")({
	staticData: {
		title: "Add Specimen",
	},
	component: NewSpecimen,
});

function NewSpecimen() {
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

	const mutation = useSpecimensCreateSpecimen({
		mutation: {
			onSuccess: () => {
				toast.success("Specimen submitted for review!", {
					description:
						"Your specimen has been submitted and is pending approval.",
					position: "bottom-right",
				});
				form.reset();
				resetStepNavigation();
			},
			onError: (err: undefined | HTTPValidationError) => {
				handleError(err);
			},
			onSettled: () => {
				//
			},
		},
	});

	const doiMutation = useDoiCreateDoi({
		mutation: {
			onSuccess: () => {},
			onError: (err: undefined | HTTPValidationError) => {
				handleError(err);
			},
			onSettled: () => {
				//
			},
		},
	});

	async function onSubmit(values: AddNewSpecimenFormValues) {
		try {
			let doi = null;
			if (!values.doi_id) {
				doi = await doiMutation.mutateAsync({
					data: {
						link: values.link,
						ref_title: values.ref_title,
						authors: values.authors,
						pub_year: values.pub_year,
					},
				});
			}
			if (doi) {
				await mutation.mutateAsync({ data: { ...values, doi_id: doi.id } });
			} else {
				await mutation.mutateAsync({ data: values });
			}
		} catch (err) {
			toast.error("Submission failed", {
				description: err instanceof Error ? err.message : "Unknown error",
				position: "bottom-right",
			});
		}
	}

	return (
		<div className="w-full max-w-6xl mx-auto space-y-4 px-4 sm:px-6">
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
