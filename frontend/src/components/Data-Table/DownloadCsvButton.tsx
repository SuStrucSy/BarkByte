import { DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DownloadCsvButtonProps {
	totalRows: number;
	filteredRows: number;
	onDownloadCsv: () => void;
}

export function DownloadCsvButton({
	totalRows,
	filteredRows,
	onDownloadCsv,
}: DownloadCsvButtonProps) {
	return (
		<Button
			variant="outline"
			size="sm"
			className="px-2 xl:px-3"
			disabled={!filteredRows}
			onClick={onDownloadCsv}
		>
			<DownloadIcon className="size-4 xl:mr-2" />
			<span className="sr-only">Download CSV</span>
			<span className="hidden xl:inline">Download</span>
			{filteredRows !== totalRows ? (
				<span className="hidden text-muted-foreground xl:ml-1 xl:inline">
					({filteredRows})
				</span>
			) : null}
		</Button>
	);
}
