import { type Control, Controller } from "react-hook-form";
import type { JoineryType, SubJoineryType } from "@/api/model";
import buttJoint from "@/assets/joineryTypes/Butt-Joint.png";
import halfLap from "@/assets/joineryTypes/Half-Lap-Joint.png";
import holdDown from "@/assets/joineryTypes/Hold-Down.png";
import plate from "@/assets/joineryTypes/Plate.png";
import slotJoint from "@/assets/joineryTypes/Slot-Joint.png";
import splineJoint from "@/assets/joineryTypes/Spline-Joint.png";
import throughTenon from "@/assets/joineryTypes/Through-Tenon.png";
import joineryTypesReference from "@/assets/joineryTypes.webp";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { AddNewSpecimenFormValues } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { FieldHelpHover } from "./FieldHelpHover";

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

const changedControlClassName =
	"border-emerald-500 text-emerald-700 focus-visible:border-emerald-600 focus-visible:ring-emerald-200/50 dark:border-emerald-700 dark:text-emerald-400";

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
			<Controller
				name="joinery_type_id"
				control={control}
				render={({ field, fieldState }) => (
					<Field data-invalid={fieldState.invalid}>
						<FieldLabel htmlFor="joinery_type_id">
							Joinery Type
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
						</FieldLabel>
						<Select
							name={field.name}
							value={field.value}
							onValueChange={field.onChange}
						>
							<SelectTrigger
								id="joinery_type_id"
								aria-invalid={fieldState.invalid}
								className={cn(
									"w-full",
									isJoineryTypeChanged && changedControlClassName,
								)}
							>
								<SelectValue placeholder="Choose joinery" />
							</SelectTrigger>
							<SelectContent position="item-aligned">
								{joineryTypeList.map((joinery) => (
									<SelectItem key={joinery.id} value={joinery.id}>
										{joinery.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<FieldDescription>Select the joinery type.</FieldDescription>
						{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
					</Field>
				)}
			/>
			<Controller
				name="sub_joinery_type_id"
				control={control}
				render={({ field, fieldState }) => (
					<Field data-invalid={fieldState.invalid}>
						<FieldLabel htmlFor="sub_joinery_type_id">
							Sub Joinery Type
						</FieldLabel>
						<Select value={field.value} onValueChange={field.onChange}>
							<SelectTrigger
								id="sub_joinery_type_id"
								className={cn(
									"w-full",
									isSubJoineryTypeChanged && changedControlClassName,
								)}
							>
								<SelectValue placeholder="Choose sub joinery" />
							</SelectTrigger>
							<SelectContent>
								{subJoineryTypeList.map((subJoinery) => (
									<SelectItem key={subJoinery.id} value={subJoinery.id}>
										{subJoinery.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<FieldDescription>
							{selectedJoineryLabel
								? `Filtered for ${selectedJoineryLabel}`
								: "Select joinery type first"}
						</FieldDescription>
						{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
					</Field>
				)}
			/>
		</>
	);
}
