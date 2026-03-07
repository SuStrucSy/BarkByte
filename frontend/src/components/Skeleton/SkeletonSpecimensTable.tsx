import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SkeletonSpecimensTable = () => (
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
      {[...Array(5)].map((_, index) => (
        <TableRow key={index}>
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
