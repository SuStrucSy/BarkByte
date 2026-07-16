import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { usePendingSpecimensListPendingSpecimens } from "@/api/endpoints/pending-specimens/pending-specimens";
import type { SpecimenPublic } from "@/api/model";
import { useIsLoggedIn } from "@/hooks/useIsLoggedIn";
import {
	type AddNewSpecimenFormValues,
	AddNewSpecimenSchema,
} from "@/lib/schemas";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Spinner } from "../ui/spinner";
import { SpecimenDetailsFields } from "./SpecimenDetailsFields";
import { SpecimenEditSection } from "./SpecimenEditSection";
import { SpecimenExperimentalFields } from "./SpecimenExperimentalFields";
import { SpecimenPendingChangesCard } from "./SpecimenPendingChangesCard";
import { SpecimenStructuralFields } from "./SpecimenStructuralFields";
import {
	buildSpecimenEditDiff,
	getSpecimenFormValues,
	mergeSpecimenFormValuesWithPendingChanges,
} from "./specimenForm.utils";
import { useEditSpecimenSubmit } from "./useEditSpecimenSubmit";
import { useSpecimenPendingChangeDisplay } from "./useSpecimenPendingChangeDisplay";

type SpecimenEditFormProps = {
	specimen: SpecimenPublic;
	onCancel: () => void;
	onSubmitted: () => void;
};

export function SpecimenEditForm({
	specimen,
	onCancel,
	onSubmitted,
}: SpecimenEditFormProps) {
	const isLoggedIn = useIsLoggedIn();
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
	const pendingChangeDisplay = useSpecimenPendingChangeDisplay({
		currentValues,
		originalValues,
		specimen,
	});

	const { isSubmitting, onSubmit } = useEditSpecimenSubmit({
		isLoggedIn,
		onSubmitted,
		originalValues,
		specimenId: specimen.id,
	});

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			className="grid gap-6 px-4 md:p-0"
		>
			<SpecimenEditSection
				title="Specimen Details"
				description="Edits create a pending update linked to this specimen."
			>
				<SpecimenDetailsFields
					control={form.control}
					changedFields={changedFieldSet}
					initialJoineryOptions={[specimen.joinery_type]}
					initialSubJoineryOptions={[specimen.sub_joinery_type]}
					initialFastenerOptions={specimen.fastener_types}
					initialLoadingDirectionOptions={specimen.loading_directions}
				/>
			</SpecimenEditSection>

			<SpecimenEditSection title="Structural Data">
				<SpecimenStructuralFields
					control={form.control}
					changedFields={changedFieldSet}
				/>
			</SpecimenEditSection>

			<SpecimenEditSection title="Experimental Data">
				<SpecimenExperimentalFields
					control={form.control}
					changedFields={changedFieldSet}
					initialQFMOptions={specimen.e_qualitative_failure_measure}
				/>
			</SpecimenEditSection>

			<Separator />

			<SpecimenPendingChangesCard
				changedFields={changedFields}
				getFieldLabel={pendingChangeDisplay.getFieldLabel}
				renderOriginalValue={pendingChangeDisplay.renderOriginalValue}
				renderCurrentValue={pendingChangeDisplay.renderCurrentValue}
			/>

			<div className="flex items-center justify-end gap-3">
				<Button
					type="button"
					variant="outline"
					onClick={() => {
						form.reset(defaultValues);
						onCancel();
					}}
					disabled={isSubmitting}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={!hasChanges || isSubmitting}>
					{isSubmitting ? (
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
