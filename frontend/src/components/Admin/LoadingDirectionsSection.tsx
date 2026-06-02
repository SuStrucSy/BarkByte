import { useQueryClient } from "@tanstack/react-query";
import {
	getLoadingdirectionGetLoadingDirectionsQueryKey,
	useLoadingdirectionCreateLoadingDirection,
	useLoadingdirectionDeleteLoadingDirection,
	useLoadingdirectionUpdateLoadingDirection,
} from "@/api/endpoints/loadingdirection/loadingdirection";
import type { LoadingDirection, LoadingDirectionCreate } from "@/api/model";
import { ReferenceLabelField } from "./ReferenceFormFields";
import { ReferenceResourceSection } from "./ReferenceResourceSection";
import { LARGE_LIMIT } from "./referenceDataConstants";

type LoadingDirectionsSectionProps = {
	items: LoadingDirection[];
	isLoading: boolean;
	isDeleteCheckPending: boolean;
	usedIds: Set<string>;
	getDeleteBlockedDescription: (label: string) => string;
};

export function LoadingDirectionsSection({
	items,
	isLoading,
	isDeleteCheckPending,
	usedIds,
	getDeleteBlockedDescription,
}: LoadingDirectionsSectionProps) {
	const queryClient = useQueryClient();
	const createLoadingDirection = useLoadingdirectionCreateLoadingDirection();
	const updateLoadingDirection = useLoadingdirectionUpdateLoadingDirection();
	const deleteLoadingDirection = useLoadingdirectionDeleteLoadingDirection();

	const invalidateLoadingDirections = () =>
		queryClient.invalidateQueries({
			queryKey: getLoadingdirectionGetLoadingDirectionsQueryKey({
				skip: 0,
				limit: LARGE_LIMIT,
			}),
		});

	return (
		<ReferenceResourceSection<LoadingDirection, LoadingDirectionCreate>
			title="Loading directions"
			items={items}
			isLoading={isLoading}
			getItemId={(item) => item.id ?? item.label}
			getDeleteDescription={(item) =>
				`Delete "${item.label}"? The backend will reject the request if specimens still reference this loading direction.`
			}
			getDeleteBlockedDescription={(item) =>
				getDeleteBlockedDescription(item.label)
			}
			isDeleteBlocked={(item) =>
				isDeleteCheckPending || (item.id ? usedIds.has(item.id) : false)
			}
			columns={[{ header: "Label", render: (item) => item.label }]}
			createDefaultValues={{ label: "" }}
			getEditDefaultValues={(item) => ({ label: item.label })}
			renderFormFields={(form) => <ReferenceLabelField form={form} />}
			onCreate={(values) =>
				createLoadingDirection.mutateAsync({ data: values })
			}
			onUpdate={(id, values) =>
				updateLoadingDirection.mutateAsync({ id, data: values })
			}
			onDelete={(id) => deleteLoadingDirection.mutateAsync({ id })}
			onInvalidate={invalidateLoadingDirections}
		/>
	);
}
