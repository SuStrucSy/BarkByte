import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

const SkeletonSpecimen = () => (
	<div className="flex flex-col gap-6">
		<div className="flex items-center justify-between">
			<Skeleton className="h-4 w-20" />
			<Skeleton className="h-8 w-24" />
		</div>
		<div className="grid gap-6 text-sm">
			<Tabs defaultValue="Meta Data">
				<TabsList>
					<TabsTrigger value="Meta Data">
						<Skeleton className="h-4 w-20" />
					</TabsTrigger>
					<TabsTrigger value="Structural Data">
						<Skeleton className="h-4 w-20" />
					</TabsTrigger>
					<TabsTrigger value="Experimental Data">
						<Skeleton className="h-4 w-20" />
					</TabsTrigger>
				</TabsList>
				<TabsContent value="Meta Data">
					<Card className="w-full h-3/4">
						<CardHeader>
							<Skeleton className="h-4 w-1/3" />
						</CardHeader>
						<CardContent className="grid gap-4 md:grid-cols-[2fr_auto_1fr] md:items-start">
							<Skeleton className="aspect-video w-full h-2/3" />
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	</div>
);

export default SkeletonSpecimen;
