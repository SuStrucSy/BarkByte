import { CheckCircle, Clock, XCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

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
		<Tabs
			value={value}
			onValueChange={(v) => {
				if (v) onChange(v as SpecimenStatus);
			}}
		>
			<TabsList>
				{(
					Object.entries(STATUS_CONFIG) as [
						SpecimenStatus,
						{ label: string; icon: React.ReactNode },
					][]
				).map(([status, { label, icon }]) => (
					<TabsTrigger
						key={status}
						value={status}
						aria-label={`Filter by ${label}`}
						className="gap-1.5"
					>
						{icon}
						{label}
					</TabsTrigger>
				))}
			</TabsList>
		</Tabs>
	);
}
