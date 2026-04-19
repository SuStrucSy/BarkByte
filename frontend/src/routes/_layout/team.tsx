import { createFileRoute } from "@tanstack/react-router";
import civilEngineeringLogo from "@/assets/branding/civil_and_mineral_engineering_logo.svg";
import dsiLogo from "@/assets/branding/dsi_logo.svg";
import amirhosseinHeidariPhoto from "@/assets/team/amirhossein-heidari.jpg";
import aryanRezaeiRadPhoto from "@/assets/team/aryan-rezaei-rad.jpg";
import danielRazaviPhoto from "@/assets/team/daniel-razavi.jpg";
import wisamAlAbedPhoto from "@/assets/team/wisam-al-abed.jpg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/_layout/team")({
	staticData: {
		title: "Team",
	},
	component: TeamPage,
});

const teamMembers = [
	{
		name: "Aryan Rezaei Rad",
		title: "Assistant Professor, Group Lead",
		description:
			"Main supervisor for the development team and Principal Investigator, translating timber engineering concepts, joints, and specimen behavior into practical product direction.",
		initials: "AR",
		photo: aryanRezaeiRadPhoto,
	},
	{
		name: "Amirhossein Heidari",
		title: "PhD Candidate, Research Assistant",
		description:
			"Led the logic design behind Timverse, including database architecture and the organization of test data.",
		initials: "AM",
		photo: amirhosseinHeidariPhoto,
	},
	{
		name: "Wisam Al Abed",
		title: "Senior Software Developer at Data Sciences Institute",
		description:
			"Worked on the frontend, deployment, infrastructure as code, and platform setup including Traefik, while also contributing to the database work.",
		initials: "WI",
		photo: wisamAlAbedPhoto,
	},
	{
		name: "Daniel Razavi",
		title: "Senior Software Developer at Data Sciences Institute",
		description:
			"Built core backend and frontend parts of Timverse and worked on the database design and implementation across the project.",
		initials: "DA",
		photo: danielRazaviPhoto,
	},
] as const;

function TeamPage() {
	return (
		<div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-2 sm:px-2 md:px-4">
			<section className="space-y-6">
				<div className="space-y-2">
					<h1 className="text-3xl font-semibold tracking-tight">
						Meet the Team
					</h1>
					<p className="max-w-2xl text-sm text-muted-foreground">
						The people building Timverse and shaping the project across design,
						data, and engineering.
					</p>
				</div>

				<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
					{teamMembers.map((member) => (
						<Card key={member.name} className="h-full">
							<CardHeader className="text-center">
								<Avatar className="mx-auto mb-3 size-24 border">
									<AvatarImage
										src={member.photo}
										alt={member.name}
										className="object-cover"
									/>
									<AvatarFallback className="text-sm font-medium tracking-wide">
										{member.initials}
									</AvatarFallback>
								</Avatar>
								<CardTitle>{member.name}</CardTitle>
								<CardDescription>{member.title}</CardDescription>
							</CardHeader>
							<CardContent className="text-center text-sm text-muted-foreground">
								{member.description}
							</CardContent>
						</Card>
					))}
				</div>
			</section>

			<section className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-3xl font-semibold tracking-tight">
						Project Partners
					</h2>
					<p className="max-w-2xl text-sm text-muted-foreground">
						This project is supported by the Department of Civil and Mineral
						Engineering and the Data Sciences Institute at the University of
						Toronto.
					</p>
				</div>

				<div className="grid gap-6 md:grid-cols-2">
					<Card className="h-full">
						<CardContent className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
							<a
								href="https://civmin.utoronto.ca/"
								target="_blank"
								rel="noreferrer"
								aria-label="Visit the Civil and Mineral Engineering website"
								className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
							>
								<img
									src={civilEngineeringLogo}
									alt="Civil Engineering logo"
									className="h-32 w-auto object-contain"
								/>
							</a>
							<a
								href="https://civmin.utoronto.ca/"
								target="_blank"
								rel="noreferrer"
								className="text-sm font-medium text-foreground underline underline-offset-4"
							>
								Department of Civil and Mineral Engineering at the University of
								Toronto
							</a>
						</CardContent>
					</Card>

					<Card className="h-full">
						<CardContent className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
							<a
								href="https://datasciences.utoronto.ca/"
								target="_blank"
								rel="noreferrer"
								aria-label="Visit the Data Sciences Institute website"
								className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
							>
								<img
									src={dsiLogo}
									alt="Data Sciences Institute logo"
									className="h-28 w-auto object-contain"
								/>
							</a>
							<a
								href="https://datasciences.utoronto.ca/"
								target="_blank"
								rel="noreferrer"
								className="text-sm font-medium text-foreground underline underline-offset-4"
							>
								Data Sciences Institute at the University of Toronto
							</a>
						</CardContent>
					</Card>
				</div>
			</section>
		</div>
	);
}
