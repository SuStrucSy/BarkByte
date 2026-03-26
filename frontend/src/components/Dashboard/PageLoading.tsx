import { Card, CardContent, CardHeader } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export function PageLoading() {
	return (
		<div className="space-y-4">
			<Card className="w-full">
				<CardHeader>
					<Skeleton className="h-4 w-2/3" />
					<Skeleton className="h-4 w-1/2" />
				</CardHeader>
			</Card>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<Card className="w-full">
					<CardHeader>
						<Skeleton className="h-4 w-2/3" />
						<Skeleton className="h-4 w-1/2" />
					</CardHeader>
					<CardContent>
						<Skeleton className="aspect-video w-full" />
					</CardContent>
				</Card>
				<Card className="w-full">
					<CardHeader>
						<Skeleton className="h-4 w-2/3" />
						<Skeleton className="h-4 w-1/2" />
					</CardHeader>
					<CardContent>
						<Skeleton className="aspect-video w-full" />
					</CardContent>
				</Card>
				<Card className="w-full col-span-2">
					<CardHeader>
						<Skeleton className="h-4 w-2/3" />
						<Skeleton className="h-4 w-1/2" />
					</CardHeader>
					<CardContent>
						<Skeleton className="aspect-video w-full" />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
