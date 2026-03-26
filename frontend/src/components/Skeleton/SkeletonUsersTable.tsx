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

const SkeletonUsersTable = () => (
	<Table>
		<TableHeader>
			<TableRow>
				<TableHead>Full name</TableHead>
				<TableHead>Email</TableHead>
				<TableHead>Role</TableHead>
				<TableHead>Status</TableHead>
				<TableHead>Actions</TableHead>
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

export default SkeletonUsersTable;
