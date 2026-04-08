import { CheckCircle, Clock, XCircle } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

export type SpecimenStatus = "pending" | "approved" | "rejected";

const STATUS_CONFIG: Record<
	SpecimenStatus,
	{ label: string; icon: React.ReactNode }
> = {
	pending: { label: "Pending", icon: <Clock className="h-4 w-4" /> },
	approved: { label: "Approved", icon: <CheckCircle className="h-4 w-4" /> },
	rejected: { label: "Rejected", icon: <XCircle className="h-4 w-4" /> },
};

export function StatusFilter({
	value,
	onChange,
}: {
	value: SpecimenStatus;
	onChange: (s: SpecimenStatus) => void;
}) {
	return (
		<ToggleGroup
			type="single"
			value={value}
			onValueChange={(v) => {
				if (v) onChange(v as SpecimenStatus);
			}}
			className="gap-1"
		>
			{(
				Object.entries(STATUS_CONFIG) as [
					SpecimenStatus,
					{ label: string; icon: React.ReactNode },
				][]
			).map(([status, { label, icon }]) => (
				<ToggleGroupItem
					key={status}
					value={status}
					aria-label={`Filter by ${label}`}
					className="gap-1.5 text-sm data-[state=on]:ring-2 data-[state=on]:ring-ring"
				>
					{icon}
					{label}
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	);
}
