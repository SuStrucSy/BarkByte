import { useQueryClient } from "@tanstack/react-query";
import {
	getFastenertypeGetFastenerTypesQueryKey,
	useFastenertypeCreateFastenerType,
	useFastenertypeDeleteFastenerType,
	useFastenertypeUpdateFastenerType,
} from "@/api/endpoints/fastenertype/fastenertype";
import type { FastenerType, FastenerTypeCreate } from "@/api/model";
import { ReferenceLabelField } from "./ReferenceFormFields";
import { ReferenceResourceSection } from "./ReferenceResourceSection";
import { LARGE_LIMIT } from "./referenceDataConstants";

type FastenerTypesSectionProps = {
	items: FastenerType[];
	isLoading: boolean;
	isDeleteCheckPending: boolean;
	usedIds: Set<string>;
	getDeleteBlockedDescription: (label: string) => string;
};

export function FastenerTypesSection({
	items,
	isLoading,
	isDeleteCheckPending,
	usedIds,
	getDeleteBlockedDescription,
}: FastenerTypesSectionProps) {
	const queryClient = useQueryClient();
	const createFastenerType = useFastenertypeCreateFastenerType();
	const updateFastenerType = useFastenertypeUpdateFastenerType();
	const deleteFastenerType = useFastenertypeDeleteFastenerType();

	const invalidateFastenerTypes = () =>
		queryClient.invalidateQueries({
			queryKey: getFastenertypeGetFastenerTypesQueryKey({
				skip: 0,
				limit: LARGE_LIMIT,
			}),
		});

	return (
		<ReferenceResourceSection<FastenerType, FastenerTypeCreate>
			title="Fastener types"
			items={items}
			isLoading={isLoading}
			getItemId={(item) => item.id ?? item.label}
			getDeleteDescription={(item) =>
				`Delete "${item.label}"? The backend will reject the request if specimens still reference this fastener type.`
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
			onCreate={(values) => createFastenerType.mutateAsync({ data: values })}
			onUpdate={(id, values) =>
				updateFastenerType.mutateAsync({ id, data: values })
			}
			onDelete={(id) => deleteFastenerType.mutateAsync({ id })}
			onInvalidate={invalidateFastenerTypes}
		/>
	);
}
