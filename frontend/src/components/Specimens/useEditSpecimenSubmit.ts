import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { getPendingSpecimensListPendingSpecimensQueryKey } from "@/api/endpoints/pending-specimens/pending-specimens";
import {
	getSpecimensReadSpecimenQueryKey,
	useSpecimensUpdateSpecimen,
} from "@/api/endpoints/specimens/specimens";
import type { HTTPValidationError } from "@/api/model";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";
import { handleError } from "@/lib/utils";
import { buildSpecimenEditDiff } from "./specimenForm.utils";

type UseEditSpecimenSubmitParams = {
	isLoggedIn: boolean;
	onSubmitted: () => void;
	originalValues: AddNewSpecimenFormValues;
	specimenId: string;
};

function getLoginRedirectUrl() {
	return typeof window === "undefined" ? "/specimens" : window.location.href;
}

export function useEditSpecimenSubmit({
	isLoggedIn,
	onSubmitted,
	originalValues,
	specimenId,
}: UseEditSpecimenSubmitParams) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const mutation = useSpecimensUpdateSpecimen({
		mutation: {
			onSuccess: async () => {
				toast.success("Edit submitted for review.", {
					description: "Your changes were saved as a pending specimen update.",
					position: "bottom-right",
				});
				await Promise.all([
					queryClient.invalidateQueries({
						queryKey: getSpecimensReadSpecimenQueryKey(specimenId),
					}),
					queryClient.invalidateQueries({
						queryKey: getPendingSpecimensListPendingSpecimensQueryKey(),
					}),
				]);
				onSubmitted();
			},
			onError: (err: undefined | HTTPValidationError) => {
				handleError(err);
			},
		},
	});

	const redirectToLogin = () =>
		navigate({
			to: "/login",
			search: { redirect: getLoginRedirectUrl() },
		});

	const onSubmit = async (values: AddNewSpecimenFormValues) => {
		if (!isLoggedIn) {
			redirectToLogin();
			return;
		}

		const diff = buildSpecimenEditDiff(originalValues, values);
		if (Object.keys(diff).length === 0) {
			toast.message("No changes to submit.");
			return;
		}

		await mutation.mutateAsync({
			id: specimenId,
			data: diff,
		});
	};

	return {
		isSubmitting: mutation.isPending,
		onSubmit,
	};
}
