import { createFileRoute } from "@tanstack/react-router";
import NotLoggedIn from "@/components/Common/NotLoggedIn";
import ChangePassword from "@/components/UserSettings/ChangePassword";
import DeleteAccount from "@/components/UserSettings/DeleteAccount";
import UserInformation from "@/components/UserSettings/UserInformation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const tabsConfig = [
	{ value: "my-profile", title: "My profile", component: UserInformation },
	{ value: "password", title: "Password", component: ChangePassword },
	{ value: "danger-zone", title: "Danger zone", component: DeleteAccount },
];

export const Route = createFileRoute("/_layout/settings")({
	staticData: {
		title: "Settings",
	},
	component: UserSettings,
});

function UserSettings() {
	const { data: currentUser } = useCurrentUser();
	const finalTabs = currentUser?.is_superuser
		? tabsConfig.slice(0, 2)
		: tabsConfig;

	if (!currentUser) {
		return <NotLoggedIn />;
	}

	return (
		<div className="flex max-w-full flex-col gap-6">
			<h1 className="text-3xl ">User Settings</h1>

			<Tabs defaultValue="my-profile">
				<TabsList>
					{finalTabs.map((tab) => (
						<TabsTrigger key={tab.value} value={tab.value}>
							{tab.title}
						</TabsTrigger>
					))}
				</TabsList>
				{finalTabs.map((tab) => (
					<TabsContent key={tab.value} value={tab.value}>
						<tab.component />
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
}
