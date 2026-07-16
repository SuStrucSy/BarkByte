import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { ChooseExistingDOICard } from "@/components/Specimens/ChooseExistingDOICard";
import { SpecimenStepFormCard } from "@/components/Specimens/SpecimenStepFormCard";
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
	const stepNavigation = useSpecimenStepNavigation(form, { mode: "create" });

	const { onSubmit } = useCreateSpecimenSubmit({
		form,
		resetStepNavigation: stepNavigation.resetStepNavigation,
	});

	return (
		<div className="mx-auto w-full max-w-6xl space-y-4 px-4 sm:px-6">
			{stepNavigation.currentStep === 0 && (
				<ChooseExistingDOICard formToFill={form} />
			)}

			<SpecimenStepFormCard
				stepNavigation={stepNavigation}
				isSubmitting={form.formState.isSubmitting}
				onSubmit={form.handleSubmit(onSubmit)}
			>
				{stepNavigation.currentStepConfig.render({
					control: form.control,
					hasExistingDoi,
				})}
			</SpecimenStepFormCard>
		</div>
	);
}
