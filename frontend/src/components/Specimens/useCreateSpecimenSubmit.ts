import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { useDoiCreateDoi } from "@/api/endpoints/doi/doi";
import { useSpecimensCreateSpecimen } from "@/api/endpoints/specimens/specimens";
import type { HTTPValidationError } from "@/api/model";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";
import { handleError } from "@/lib/utils";

type UseCreateSpecimenSubmitParams = {
	form: UseFormReturn<AddNewSpecimenFormValues>;
	resetStepNavigation: () => void;
};

export function useCreateSpecimenSubmit({
	form,
	resetStepNavigation,
}: UseCreateSpecimenSubmitParams) {
	const specimenMutation = useSpecimensCreateSpecimen({
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

	const onSubmit = async (values: AddNewSpecimenFormValues) => {
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
				await specimenMutation.mutateAsync({
					data: { ...values, doi_id: doi.id },
				});
				return;
			}

			await specimenMutation.mutateAsync({ data: values });
		} catch (err) {
			toast.error("Submission failed", {
				description: err instanceof Error ? err.message : "Unknown error",
				position: "bottom-right",
			});
		}
	};

	return { onSubmit };
}
