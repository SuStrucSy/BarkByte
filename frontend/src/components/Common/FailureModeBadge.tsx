import { Badge } from "@/components/ui/badge";

type FailureModeBadgeProps = React.ComponentProps<typeof Badge> & {
	label: string;
};

export function FailureModeBadge({
	label,
	className,
	children,
	...props
}: FailureModeBadgeProps) {
	return (
		<Badge
			variant="outline"
			className={["badge-failure-mode", className].filter(Boolean).join(" ")}
			{...props}
		>
			{children ?? label}
		</Badge>
	);
}
