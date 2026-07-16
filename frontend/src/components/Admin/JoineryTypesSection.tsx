import { useQueryClient } from "@tanstack/react-query";
import {
	getJoinerytypeGetJtypesQueryKey,
	useJoinerytypeCreateJtype,
	useJoinerytypeDeleteJtype,
	useJoinerytypeUpdateJtype,
} from "@/api/endpoints/joinerytype/joinerytype";
import { getSubjoinerytypeGetSjtypesQueryKey } from "@/api/endpoints/subjoinerytype/subjoinerytype";
import type { JoineryType, JoineryTypeCreate } from "@/api/model";
import { Badge } from "@/components/ui/badge";
import {
	ReferenceBooleanField,
	ReferenceLabelField,
} from "./ReferenceFormFields";
import { ReferenceResourceSection } from "./ReferenceResourceSection";
import { LARGE_LIMIT } from "./referenceDataConstants";

type JoineryTypesSectionProps = {
	items: JoineryType[];
	isLoading: boolean;
	isDeleteCheckPending: boolean;
	usedIds: Set<string>;
	getDeleteBlockedDescription: (label: string) => string;
};

export function JoineryTypesSection({
	items,
	isLoading,
	isDeleteCheckPending,
	usedIds,
	getDeleteBlockedDescription,
}: JoineryTypesSectionProps) {
	const queryClient = useQueryClient();
	const createJoineryType = useJoinerytypeCreateJtype();
	const updateJoineryType = useJoinerytypeUpdateJtype();
	const deleteJoineryType = useJoinerytypeDeleteJtype();

	const invalidateJoineryTypes = () =>
		queryClient.invalidateQueries({
			queryKey: getJoinerytypeGetJtypesQueryKey({
				skip: 0,
				limit: LARGE_LIMIT,
			}),
		});

	const invalidateSubJoineryTypes = () =>
		queryClient.invalidateQueries({
			queryKey: getSubjoinerytypeGetSjtypesQueryKey({
				skip: 0,
				limit: LARGE_LIMIT,
			}),
		});

	return (
		<ReferenceResourceSection<JoineryType, JoineryTypeCreate>
			title="Joinery types"
			items={items}
			isLoading={isLoading}
			getItemId={(item) => item.id ?? item.label}
			getDeleteDescription={(item) =>
				`Delete "${item.label}"? The backend will reject the request if any specimen still references this joinery type.`
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
					header: "Has dowel",
					render: (item) => (
						<Badge variant={item.has_dowel ? "default" : "outline"}>
							{item.has_dowel ? "Yes" : "No"}
						</Badge>
					),
				},
			]}
			createDefaultValues={{ label: "", has_dowel: false }}
			getEditDefaultValues={(item) => ({
				label: item.label,
				has_dowel: item.has_dowel,
			})}
			renderFormFields={(form) => (
				<>
					<ReferenceLabelField form={form} />
					<ReferenceBooleanField
						form={form}
						name="has_dowel"
						label="Has dowel"
						description="Marks whether this joinery type uses dowels by default."
					/>
				</>
			)}
			onCreate={(values) => createJoineryType.mutateAsync({ data: values })}
			onUpdate={(id, values) =>
				updateJoineryType.mutateAsync({ id, data: values })
			}
			onDelete={(id) => deleteJoineryType.mutateAsync({ id })}
			onInvalidate={async () => {
				await invalidateJoineryTypes();
				await invalidateSubJoineryTypes();
			}}
		/>
	);
}
