import { useQueryClient } from "@tanstack/react-query";
import {
	getSubjoinerytypeGetSjtypesQueryKey,
	useSubjoinerytypeCreateSjtype,
	useSubjoinerytypeDeleteSjtype,
	useSubjoinerytypeUpdateSjtype,
} from "@/api/endpoints/subjoinerytype/subjoinerytype";
import type {
	JoineryType,
	SubJoineryType,
	SubJoineryTypeCreate,
} from "@/api/model";
import {
	ReferenceLabelField,
	ReferenceSelectField,
} from "./ReferenceFormFields";
import { ReferenceResourceSection } from "./ReferenceResourceSection";
import { LARGE_LIMIT } from "./referenceDataConstants";

type SubJoineryTypesSectionProps = {
	items: SubJoineryType[];
	joineryTypes: JoineryType[];
	joineryLabelById: Map<string, string>;
	isLoading: boolean;
	isJoineryTypesLoading: boolean;
	isDeleteCheckPending: boolean;
	usedIds: Set<string>;
	getDeleteBlockedDescription: (label: string) => string;
};

export function SubJoineryTypesSection({
	items,
	joineryTypes,
	joineryLabelById,
	isLoading,
	isJoineryTypesLoading,
	isDeleteCheckPending,
	usedIds,
	getDeleteBlockedDescription,
}: SubJoineryTypesSectionProps) {
	const queryClient = useQueryClient();
	const createSubJoineryType = useSubjoinerytypeCreateSjtype();
	const updateSubJoineryType = useSubjoinerytypeUpdateSjtype();
	const deleteSubJoineryType = useSubjoinerytypeDeleteSjtype();

	const invalidateSubJoineryTypes = () =>
		queryClient.invalidateQueries({
			queryKey: getSubjoinerytypeGetSjtypesQueryKey({
				skip: 0,
				limit: LARGE_LIMIT,
			}),
		});

	return (
		<ReferenceResourceSection<SubJoineryType, SubJoineryTypeCreate>
			title="Sub-joinery types"
			items={items}
			isLoading={isLoading || isJoineryTypesLoading}
			getItemId={(item) => item.id ?? `${item.joinery_type_id}-${item.label}`}
			getDeleteDescription={(item) =>
				`Delete "${item.label}"? The backend will reject the request if any specimen still references this sub-joinery type.`
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
					header: "Parent joinery type",
					render: (item) =>
						joineryLabelById.get(item.joinery_type_id) ??
						"Unknown joinery type",
				},
			]}
			createDefaultValues={{
				label: "",
				joinery_type_id: joineryTypes[0]?.id ?? "",
			}}
			getEditDefaultValues={(item) => ({
				label: item.label,
				joinery_type_id: item.joinery_type_id,
			})}
			renderFormFields={(form) => (
				<>
					<ReferenceLabelField form={form} />
					<ReferenceSelectField
						form={form}
						name="joinery_type_id"
						label="Parent joinery type"
						placeholder="Select a joinery type"
						options={joineryTypes.map((option) => ({
							label: option.label,
							value: option.id ?? "",
						}))}
					/>
				</>
			)}
			onCreate={(values) => createSubJoineryType.mutateAsync({ data: values })}
			onUpdate={(id, values) =>
				updateSubJoineryType.mutateAsync({ id, data: values })
			}
			onDelete={(id) => deleteSubJoineryType.mutateAsync({ id })}
			onInvalidate={invalidateSubJoineryTypes}
		/>
	);
}
