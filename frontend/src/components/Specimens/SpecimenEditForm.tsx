import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useFailuremodeGetModes } from "@/api/endpoints/failuremode/failuremode";
import { useFastenertypeGetFastenerTypes } from "@/api/endpoints/fastenertype/fastenertype";
import { useJoinerytypeGetJtypes } from "@/api/endpoints/joinerytype/joinerytype";
import { useLoadingdirectionGetLoadingDirections } from "@/api/endpoints/loadingdirection/loadingdirection";
import {
	getPendingSpecimensListPendingSpecimensQueryKey,
	usePendingSpecimensListPendingSpecimens,
} from "@/api/endpoints/pending-specimens/pending-specimens";
import {
	getSpecimensReadSpecimenQueryKey,
	useSpecimensUpdateSpecimen,
} from "@/api/endpoints/specimens/specimens";
import { useSubjoinerytypeGetSjtypes } from "@/api/endpoints/subjoinerytype/subjoinerytype";
import type { HTTPValidationError, SpecimenPublic } from "@/api/model";
import { useIsLoggedIn } from "@/hooks/useIsLoggedIn";
import {
	type AddNewSpecimenFormValues,
	AddNewSpecimenSchema,
} from "@/lib/schemas";
import {
	getDisplayText,
	handleError,
	humanizeLabel,
	renderValue,
} from "@/lib/utils";
import { Button } from "../ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";
import { Spinner } from "../ui/spinner";
import { SpecimenDetailsFields } from "./SpecimenDetailsFields";
import { SpecimenExperimentalFields } from "./SpecimenExperimentalFields";
import { SpecimenStructuralFields } from "./SpecimenStructuralFields";
import {
	buildSpecimenEditDiff,
	getSpecimenFormValues,
	mergeSpecimenFormValuesWithPendingChanges,
} from "./specimenForm.utils";

type SpecimenEditFormProps = {
	specimen: SpecimenPublic;
	onCancel: () => void;
	onSubmitted: () => void;
};

const manualFieldLabels: Partial<
	Record<keyof AddNewSpecimenFormValues, string>
> = {
	e_qualitative_failure_measure: "QFM",
	e_qfm_description: "QFM Description",
	note: "Specimen Note",
	doi_id: "DOI",
	joinery_type_id: "Joinery Type",
	sub_joinery_type_id: "Sub Joinery Type",
	fastener_type_ids: "Fastener Types",
	loading_direction_ids: "Loading Directions",
};

function getLoginRedirectUrl() {
	return typeof window === "undefined" ? "/specimens" : window.location.href;
}

function getFieldLabel(field: keyof AddNewSpecimenFormValues) {
	return manualFieldLabels[field] ?? humanizeLabel(field);
}

function formatSingleLookupValue(
	value: string | undefined,
	labelLookup: Map<string, string>,
) {
	return value
		? getDisplayText(labelLookup.get(value) ?? value, "Unnamed")
		: "—";
}

function formatMultiLookupValue(
	value: string[] | undefined,
	labelLookup: Map<string, string>,
) {
	return renderValue(
		(value ?? []).map((id) =>
			getDisplayText(labelLookup.get(id) ?? id, "Unnamed"),
		),
	);
}

export function SpecimenEditForm({
	specimen,
	onCancel,
	onSubmitted,
}: SpecimenEditFormProps) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const isLoggedIn = useIsLoggedIn();
	const [lastPendingId, setLastPendingId] = useState<string | null>(null);
	const originalValues = useMemo(
		() => getSpecimenFormValues(specimen),
		[specimen],
	);
	const { data: pendingSpecimensData } =
		usePendingSpecimensListPendingSpecimens(
			{ status: "pending" },
			{
				query: {
					enabled: isLoggedIn,
				},
			},
		);
	const activePendingSpecimen = useMemo(
		() =>
			pendingSpecimensData?.pending_specimens.find(
				(pending) => pending.specimen_id === specimen.id,
			),
		[pendingSpecimensData?.pending_specimens, specimen.id],
	);
	const defaultValues = useMemo(
		() =>
			mergeSpecimenFormValuesWithPendingChanges(
				originalValues,
				activePendingSpecimen?.changed_data as
					| Record<string, unknown>
					| undefined,
			),
		[activePendingSpecimen?.changed_data, originalValues],
	);

	const form = useForm<AddNewSpecimenFormValues>({
		resolver: zodResolver(AddNewSpecimenSchema),
		defaultValues,
		mode: "onChange",
	});

	useEffect(() => {
		form.reset(defaultValues);
	}, [defaultValues, form]);

	const currentValues = form.watch();
	const pendingDiff = useMemo(
		() => buildSpecimenEditDiff(originalValues, currentValues),
		[originalValues, currentValues],
	);
	const changedFields = useMemo(
		() =>
			Object.keys(pendingDiff) as Array<
				keyof typeof pendingDiff & keyof AddNewSpecimenFormValues
			>,
		[pendingDiff],
	);
	const hasChanges = Object.keys(pendingDiff).length > 0;
	const changedFieldSet = useMemo(
		() => new Set(changedFields),
		[changedFields],
	);
	const { data: joineryData } = useJoinerytypeGetJtypes();
	const { data: subjoineryData } = useSubjoinerytypeGetSjtypes();
	const { data: fastenerData } = useFastenertypeGetFastenerTypes();
	const { data: loadingDirectionData } =
		useLoadingdirectionGetLoadingDirections();
	const { data: qfmData } = useFailuremodeGetModes(
		{
			connector: currentValues.connector,
			dowel: currentValues.dowel,
		},
		{
			query: {
				queryKey: [
					"editQfmTypes",
					currentValues.connector,
					currentValues.dowel,
				],
			},
		},
	);
	const originalQfmLookup = useMemo(
		() =>
			new Map(
				specimen.e_qualitative_failure_measure.map((item) => [
					item.id,
					item.label,
				]),
			),
		[specimen.e_qualitative_failure_measure],
	);
	const currentQfmLookup = useMemo(
		() => new Map((qfmData?.data ?? []).map((item) => [item.id, item.label])),
		[qfmData?.data],
	);
	const joineryLookup = useMemo(
		() =>
			new Map((joineryData?.data ?? []).map((item) => [item.id, item.label])),
		[joineryData?.data],
	);
	const subjoineryLookup = useMemo(
		() =>
			new Map(
				(subjoineryData?.data ?? []).map((item) => [item.id, item.label]),
			),
		[subjoineryData?.data],
	);
	const fastenerLookup = useMemo(
		() =>
			new Map((fastenerData?.data ?? []).map((item) => [item.id, item.label])),
		[fastenerData?.data],
	);
	const loadingDirectionLookup = useMemo(
		() =>
			new Map(
				(loadingDirectionData?.data ?? []).map((item) => [item.id, item.label]),
			),
		[loadingDirectionData?.data],
	);
	const renderChangedFieldValue = (
		field: keyof AddNewSpecimenFormValues,
		values: AddNewSpecimenFormValues,
		qfmLookup: Map<string, string>,
	) => {
		if (field === "e_qualitative_failure_measure") {
			return formatMultiLookupValue(
				values.e_qualitative_failure_measure,
				qfmLookup,
			);
		}

		if (field === "joinery_type_id") {
			return formatSingleLookupValue(values.joinery_type_id, joineryLookup);
		}

		if (field === "sub_joinery_type_id") {
			return formatSingleLookupValue(
				values.sub_joinery_type_id,
				subjoineryLookup,
			);
		}

		if (field === "fastener_type_ids") {
			return formatMultiLookupValue(values.fastener_type_ids, fastenerLookup);
		}

		if (field === "loading_direction_ids") {
			return formatMultiLookupValue(
				values.loading_direction_ids,
				loadingDirectionLookup,
			);
		}

		return renderValue(values[field]);
	};

	const mutation = useSpecimensUpdateSpecimen({
		mutation: {
			onSuccess: async (pending) => {
				setLastPendingId(pending.id);
				toast.success("Edit submitted for review.", {
					description: "Your changes were saved as a pending specimen update.",
					position: "bottom-right",
				});
				await Promise.all([
					queryClient.invalidateQueries({
						queryKey: getSpecimensReadSpecimenQueryKey(specimen.id),
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
			id: specimen.id,
			data: diff,
		});
	};

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			className="grid gap-6 px-4 md:p-0"
		>
			{lastPendingId ? (
				<Card className="border-emerald-200 bg-emerald-50/70">
					<CardHeader>
						<CardTitle className="text-base">Pending update created</CardTitle>
						<CardDescription>Your changes are pending review.</CardDescription>
					</CardHeader>
				</Card>
			) : null}

			<Card>
				<CardHeader>
					<CardTitle>Specimen Details</CardTitle>
					<CardDescription>
						Edits create a pending update linked to this specimen.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<SpecimenDetailsFields
						control={form.control}
						changedFields={changedFieldSet}
						initialJoineryOptions={[specimen.joinery_type]}
						initialSubJoineryOptions={[specimen.sub_joinery_type]}
						initialFastenerOptions={specimen.fastener_types}
						initialLoadingDirectionOptions={specimen.loading_directions}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Structural Data</CardTitle>
				</CardHeader>
				<CardContent>
					<SpecimenStructuralFields
						control={form.control}
						changedFields={changedFieldSet}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Experimental Data</CardTitle>
				</CardHeader>
				<CardContent>
					<SpecimenExperimentalFields
						control={form.control}
						changedFields={changedFieldSet}
						initialQFMOptions={specimen.e_qualitative_failure_measure}
					/>
				</CardContent>
			</Card>

			<Separator />

			<Card className={hasChanges ? "" : "border-dashed"}>
				<CardHeader>
					<CardTitle className="text-base">
						{hasChanges ? "Pending Changes" : "No pending changes"}
					</CardTitle>
					<CardDescription>
						{hasChanges
							? "Review the before and after values before you submit."
							: "Update one or more fields before submitting for review."}
					</CardDescription>
				</CardHeader>
				{hasChanges ? (
					<CardContent className="grid gap-3">
						{changedFields.map((field) => (
							<div
								key={field}
								className="grid gap-1 rounded-md border px-3 py-2"
							>
								<span className="text-[10px] tracking-wide text-muted-foreground uppercase">
									{getFieldLabel(field)}
								</span>
								<div className="text-sm text-red-600 line-through decoration-red-400">
									{renderChangedFieldValue(
										field,
										originalValues,
										originalQfmLookup,
									)}
								</div>
								<div className="text-sm text-green-700 dark:text-green-400">
									{renderChangedFieldValue(
										field,
										currentValues,
										currentQfmLookup,
									)}
								</div>
							</div>
						))}
					</CardContent>
				) : null}
			</Card>

			<div className="flex items-center justify-end gap-3">
				<Button
					type="button"
					variant="outline"
					onClick={() => {
						form.reset(defaultValues);
						onCancel();
					}}
					disabled={mutation.isPending}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={!hasChanges || mutation.isPending}>
					{mutation.isPending ? (
						<>
							<Spinner className="h-4 w-4" />
							Submitting…
						</>
					) : (
						"Submit Pending Edit"
					)}
				</Button>
			</div>
		</form>
	);
}
