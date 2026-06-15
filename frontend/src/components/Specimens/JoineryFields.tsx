import type { Control } from "react-hook-form";
import type { JoineryType, SubJoineryType } from "@/api/model";
import buttJoint from "@/assets/joineryTypes/Butt-Joint.png";
import halfLap from "@/assets/joineryTypes/Half-Lap-Joint.png";
import holdDown from "@/assets/joineryTypes/Hold-Down.png";
import plate from "@/assets/joineryTypes/Plate.png";
import slotJoint from "@/assets/joineryTypes/Slot-Joint.png";
import splineJoint from "@/assets/joineryTypes/Spline-Joint.png";
import throughTenon from "@/assets/joineryTypes/Through-Tenon.png";
import joineryTypesReference from "@/assets/joineryTypes.webp";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";
import { FieldHelpHover } from "./FieldHelpHover";
import { SpecimenSelectField } from "./SpecimenSelectField";

type JoineryOption = JoineryType & { id: string };
type SubJoineryOption = SubJoineryType & { id: string };

type JoineryFieldsProps = {
	control: Control<AddNewSpecimenFormValues>;
	selectedJoineryTypeId?: string;
	joineryTypeList: JoineryOption[];
	subJoineryTypeList: SubJoineryOption[];
	isJoineryTypeChanged?: boolean;
	isSubJoineryTypeChanged?: boolean;
};

const JOINERY_IMAGES: Record<string, string> = {
	"butt-joint": buttJoint,
	"hold-down": holdDown,
	"through-tenon": throughTenon,
	"half-lap-joint": halfLap,
	plate: plate,
	"slot-joint": slotJoint,
	"spline-joint": splineJoint,
};

const toImageKey = (label: string) => label.toLowerCase().replace(/\s+/g, "-");

const getJoineryImage = (label?: string) =>
	label ? JOINERY_IMAGES[toImageKey(label)] : undefined;

export function JoineryFields({
	control,
	selectedJoineryTypeId,
	joineryTypeList,
	subJoineryTypeList,
	isJoineryTypeChanged = false,
	isSubJoineryTypeChanged = false,
}: JoineryFieldsProps) {
	const selectedJoinery = joineryTypeList.find(
		(joinery) => joinery.id === selectedJoineryTypeId,
	);
	const selectedJoineryLabel = selectedJoinery?.label;
	const joineryImage = getJoineryImage(selectedJoineryLabel);

	return (
		<>
			<SpecimenSelectField
				control={control}
				name="joinery_type_id"
				label="Joinery Type"
				placeholder="Choose joinery"
				options={joineryTypeList}
				description="Select the joinery type."
				labelAddon={
					<FieldHelpHover
						title={selectedJoineryLabel}
						content={
							joineryImage ? (
								<img
									src={joineryImage}
									alt={selectedJoineryLabel ?? "Selected joinery type"}
									className="w-48 h-auto"
								/>
							) : (
								<img
									src={joineryTypesReference}
									alt="Reference sheet showing timber joinery and connection types"
									className="w-4xl h-auto"
									decoding="async"
								/>
							)
						}
					/>
				}
				isChanged={isJoineryTypeChanged}
				contentPosition="item-aligned"
			/>
			<SpecimenSelectField
				control={control}
				name="sub_joinery_type_id"
				label="Sub Joinery Type"
				placeholder="Choose sub joinery"
				options={subJoineryTypeList}
				description={
					selectedJoineryLabel
						? `Filtered for ${selectedJoineryLabel}`
						: "Select joinery type first"
				}
				isChanged={isSubJoineryTypeChanged}
			/>
		</>
	);
}
