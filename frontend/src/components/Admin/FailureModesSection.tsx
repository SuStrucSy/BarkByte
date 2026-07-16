import { useQueryClient } from "@tanstack/react-query";
import {
	getFailuremodeGetModesQueryKey,
	useFailuremodeCreateMode,
	useFailuremodeDeleteMode,
	useFailuremodeUpdateMode,
} from "@/api/endpoints/failuremode/failuremode";
import {
	type FailureMode,
	type FailureModeCreate,
	FailureModeType,
} from "@/api/model";
import { Badge } from "@/components/ui/badge";
import {
	ReferenceLabelField,
	ReferenceSelectField,
} from "./ReferenceFormFields";
import { ReferenceResourceSection } from "./ReferenceResourceSection";
import { LARGE_LIMIT } from "./referenceDataConstants";

type FailureModesSectionProps = {
	items: FailureMode[];
	isLoading: boolean;
	isDeleteCheckPending: boolean;
	usedIds: Set<string>;
	getDeleteBlockedDescription: (label: string) => string;
};

const FAILURE_MODE_PARAMS = {
	dowel: true,
	connector: true,
	skip: 0,
	limit: LARGE_LIMIT,
};

export function FailureModesSection({
	items,
	isLoading,
	isDeleteCheckPending,
	usedIds,
	getDeleteBlockedDescription,
}: FailureModesSectionProps) {
	const queryClient = useQueryClient();
	const createFailureMode = useFailuremodeCreateMode();
	const updateFailureMode = useFailuremodeUpdateMode();
	const deleteFailureMode = useFailuremodeDeleteMode();

	const invalidateFailureModes = () =>
		queryClient.invalidateQueries({
			queryKey: getFailuremodeGetModesQueryKey(FAILURE_MODE_PARAMS),
		});

	return (
		<ReferenceResourceSection<FailureMode, FailureModeCreate>
			title="Failure modes"
			items={items}
			isLoading={isLoading}
			getItemId={(item) => item.id ?? item.label}
			getDeleteDescription={(item) =>
				`Delete "${item.label}"? This cannot be undone, and the backend will block removal if specimens still reference it.`
			}
			getDeleteBlockedDescription={(item) =>
				getDeleteBlockedDescription(item.label)
			}
			isDeleteBlocked={(item) =>
				isDeleteCheckPending || (item.id ? usedIds.has(item.id) : false)
			}
			columns={[
				{ header: "Label", render: (item) => item.label },
				{
					header: "Type",
					render: (item) => <Badge variant="outline">{item.type}</Badge>,
				},
			]}
			createDefaultValues={{ label: "", type: FailureModeType.WOOD }}
			getEditDefaultValues={(item) => ({
				label: item.label,
				type: item.type,
			})}
			renderFormFields={(form) => (
				<>
					<ReferenceLabelField form={form} />
					<ReferenceSelectField
						form={form}
						name="type"
						label="Type"
						placeholder="Select a type"
						options={Object.values(FailureModeType).map((option) => ({
							label: option,
							value: option,
						}))}
					/>
				</>
			)}
			onCreate={(values) => createFailureMode.mutateAsync({ data: values })}
			onUpdate={(id, values) =>
				updateFailureMode.mutateAsync({ id, data: values })
			}
			onDelete={(id) => deleteFailureMode.mutateAsync({ id })}
			onInvalidate={invalidateFailureModes}
		/>
	);
}
