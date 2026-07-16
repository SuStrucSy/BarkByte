import type { UseFormReset } from "react-hook-form";
import { toast } from "sonner";
import { useDoiCreateDoi } from "@/api/endpoints/doi/doi";
import { useJoinerytypeGetJtypes } from "@/api/endpoints/joinerytype/joinerytype";
import { useSpecimensCreateSpecimen } from "@/api/endpoints/specimens/specimens";
import type {
	HTTPValidationError,
	JoineryType,
	PendingSpecimenCreate,
} from "@/api/model";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";
import { handleError } from "@/lib/utils";

type UseCreateSpecimenSubmitParams = {
	form: { reset: UseFormReset<AddNewSpecimenFormValues> };
	resetStepNavigation: () => void;
};

function buildPendingSpecimenCreatePayload(
	values: AddNewSpecimenFormValues,
	doiId: string,
	joineryTypes: JoineryType[],
): PendingSpecimenCreate {
	const selectedJoineryType = joineryTypes.find(
		(joineryType) => joineryType.id === values.joinery_type_id,
	);

	if (!selectedJoineryType) {
		throw new Error("Selected joinery type was not found.");
	}

	const { authors, doi_id, link, pub_year, ref_title, ...specimenValues } =
		values;

	return {
		...specimenValues,
		doi_id: doiId,
		dowel: selectedJoineryType.has_dowel,
	};
}

export function useCreateSpecimenSubmit({
	form,
	resetStepNavigation,
}: UseCreateSpecimenSubmitParams) {
	const { data: joineryData } = useJoinerytypeGetJtypes();
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

			const doiId = doi?.id ?? values.doi_id;
			if (!doiId) {
				throw new Error("A DOI is required before submitting the specimen.");
			}

			await specimenMutation.mutateAsync({
				data: buildPendingSpecimenCreatePayload(
					values,
					doiId,
					joineryData?.data ?? [],
				),
			});
			return;
		} catch (err) {
			toast.error("Submission failed", {
				description: err instanceof Error ? err.message : "Unknown error",
				position: "bottom-right",
			});
		}
	};

	return { onSubmit };
}
