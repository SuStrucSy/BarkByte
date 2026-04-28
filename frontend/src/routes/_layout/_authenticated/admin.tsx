import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { z } from "zod/v4";
import ReferenceDataManager from "@/components/Admin/ReferenceDataManager";
import { UsersTable } from "@/components/Admin/UsersTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const usersSearchSchema = z.object({
	page: z.number().catch(1),
});

export const Route = createFileRoute("/_layout/_authenticated/admin")({
	staticData: {
		title: "Admin settings",
	},
	beforeLoad: ({ context }) => {
		const currentUser = context.auth?.data;

		if (currentUser && !currentUser.is_superuser) {
			throw redirect({ to: "/" });
		}
	},
	component: Admin,
	validateSearch: (search) => usersSearchSchema.parse(search),
});

function Admin() {
	const { page } = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });

	const handlePageChange = (nextPage: number) => {
		navigate({
			search: { page: nextPage },
		});
	};

	return (
		<div className="max-w-full p-4">
			<h1 className="pt-3 text-3xl">Admin Settings</h1>
			<Tabs defaultValue="user-management" className="pt-4">
				<TabsList>
					<TabsTrigger value="user-management">User management</TabsTrigger>
					<TabsTrigger value="reference-data">Reference data</TabsTrigger>
				</TabsList>
				<TabsContent value="user-management" className="space-y-4 pt-4">
					<UsersTable page={page} onPageChange={handlePageChange} />
				</TabsContent>
				<TabsContent value="reference-data" className="pt-4">
					<ReferenceDataManager />
				</TabsContent>
			</Tabs>
		</div>
	);
}
