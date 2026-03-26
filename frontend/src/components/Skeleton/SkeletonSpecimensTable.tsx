import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

const SKELETON_ROWS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"];

const SKELETON_HEADER = ["sh-1", "sh-2", "sh-3", "sh-4", "sh-5"];

const SkeletonSpecimensTable = () => (
	<Table>
		<TableHeader>
			<TableRow>
				{SKELETON_HEADER.map((id) => (
					<TableHead key={id}>
						<Skeleton className="h-2 w-10" />
					</TableHead>
				))}
			</TableRow>
		</TableHeader>
		<TableBody>
			{SKELETON_ROWS.map((id) => (
				<TableRow key={id}>
					<TableCell>
						<Skeleton className="h-4 w-[250px]" />
					</TableCell>
					<TableCell>
						<Skeleton className="h-4 w-[250px]" />
					</TableCell>
					<TableCell>
						<Skeleton className="h-4 w-[250px]" />
					</TableCell>
					<TableCell>
						<Skeleton className="h-4 w-[250px]" />
					</TableCell>
					<TableCell>
						<Skeleton className="h-4 w-[250px]" />
					</TableCell>
				</TableRow>
			))}
		</TableBody>
	</Table>
);

export default SkeletonSpecimensTable;
