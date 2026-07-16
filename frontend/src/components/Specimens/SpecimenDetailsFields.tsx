import type { Control } from "react-hook-form";
import type {
	FastenerType,
	JoineryType,
	LoadingDirection,
	SubJoineryType,
} from "@/api/model";
import { FieldGroup } from "@/components/ui/field";
import { ASSEMBLY_TYPES } from "@/lib/constants";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";
import { JoineryFields } from "./JoineryFields";
import { SpecimenCheckboxField } from "./SpecimenCheckboxField";
import { SpecimenMultiComboboxField } from "./SpecimenMultiComboboxField";
import { SpecimenNumberField } from "./SpecimenNumberField";
import { SpecimenRadioGroupField } from "./SpecimenRadioGroupField";
import { SpecimenTextareaField } from "./SpecimenTextareaField";
import { SpecimenTextField } from "./SpecimenTextField";
import { useSpecimenDetailsOptions } from "./useSpecimenDetailsOptions";

const PRACTICE_OPTIONS = ["Conventional", "Research and Development"] as const;

interface AddSpecimenFormProps {
	control: Control<AddNewSpecimenFormValues>;
	changedFields?: Set<keyof AddNewSpecimenFormValues>;
	initialJoineryOptions?: JoineryType[];
	initialSubJoineryOptions?: SubJoineryType[];
	initialFastenerOptions?: FastenerType[];
	initialLoadingDirectionOptions?: LoadingDirection[];
}

export function SpecimenDetailsFields({
	control,
	changedFields,
	initialJoineryOptions = [],
	initialSubJoineryOptions = [],
	initialFastenerOptions = [],
	initialLoadingDirectionOptions = [],
}: AddSpecimenFormProps) {
	const {
		selectedJoineryTypeId,
		joineryTypeList,
		subJoineryTypeList,
		fastenerTypeList,
		loadingDirectionList,
	} = useSpecimenDetailsOptions({
		control,
		initialJoineryOptions,
		initialSubJoineryOptions,
		initialFastenerOptions,
		initialLoadingDirectionOptions,
	});

	return (
		<FieldGroup>
			<SpecimenTextField
				control={control}
				name="specimen_reference_id"
				label="Reference ID"
				isChanged={changedFields?.has("specimen_reference_id")}
			/>
			<SpecimenRadioGroupField
				control={control}
				name="assembly_type"
				label="Assembly Type"
				description="Select how specimen is assembled"
				options={ASSEMBLY_TYPES}
				isChanged={changedFields?.has("assembly_type")}
			/>
			<JoineryFields
				control={control}
				selectedJoineryTypeId={selectedJoineryTypeId}
				joineryTypeList={joineryTypeList}
				subJoineryTypeList={subJoineryTypeList}
				isJoineryTypeChanged={changedFields?.has("joinery_type_id")}
				isSubJoineryTypeChanged={changedFields?.has("sub_joinery_type_id")}
			/>
			<SpecimenMultiComboboxField
				control={control}
				name="fastener_type_ids"
				label="Fastener Types"
				description="Select one or more fastener types"
				emptyMessage="No fastener types found."
				options={fastenerTypeList}
				isChanged={changedFields?.has("fastener_type_ids")}
			/>
			<SpecimenMultiComboboxField
				control={control}
				name="loading_direction_ids"
				label="Loading Direction"
				description="Select one or more loading directions"
				emptyMessage="No loading direction found."
				options={loadingDirectionList}
				isChanged={changedFields?.has("loading_direction_ids")}
			/>

			<SpecimenRadioGroupField
				control={control}
				name="practice"
				label="Practice"
				options={PRACTICE_OPTIONS}
				isChanged={changedFields?.has("practice")}
			/>

			<SpecimenCheckboxField
				control={control}
				name="connector"
				label="Has Connector"
				isChanged={changedFields?.has("connector")}
			/>

			<SpecimenNumberField
				control={control}
				name="fastener_numbers"
				label="Number of Fasteners"
				isChanged={changedFields?.has("fastener_numbers")}
			/>
			<SpecimenNumberField
				control={control}
				name="replicate_tests"
				label="Replicate Tests"
				isChanged={changedFields?.has("replicate_tests")}
			/>

			<SpecimenTextareaField
				control={control}
				name="connection_description"
				label="Connection Description"
				rows={3}
				isChanged={changedFields?.has("connection_description")}
			/>
			<SpecimenTextareaField
				control={control}
				name="note"
				label="Note (optional)"
				rows={2}
				isChanged={changedFields?.has("note")}
			/>
		</FieldGroup>
	);
}
