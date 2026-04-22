import { Button } from "@/components/ui/button";

interface DataTableFilterResetButtonProps {
	field: string;
	count: number;
	onReset: (field: string) => void;
}

export function DataTableFilterResetButton({
	field,
	count,
	onReset,
}: DataTableFilterResetButtonProps) {
	if (count === 0) return null;

	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			className="h-6 px-2 text-xs hover:bg-muted active:bg-muted"
			onClick={(event) => {
				event.preventDefault();
				event.stopPropagation();
				onReset(field);
			}}
		>
			Reset
		</Button>
	);
}
