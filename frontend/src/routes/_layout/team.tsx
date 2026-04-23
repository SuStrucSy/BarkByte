import { createFileRoute } from "@tanstack/react-router";
import { MemberCard } from "@/components/Team/MemberCard";
import { SupportCard } from "@/components/Team/SupportCard";
import {
	supportingOrganizations,
	teamMembers,
} from "@/components/Team/team.constants";

export const Route = createFileRoute("/_layout/team")({
	staticData: {
		title: "Team",
	},
	component: TeamPage,
});

function TeamPage() {
	return (
		<div className="p-4 mx-auto w-full max-w-5xl">
			<div className="mb-12 space-y-3">
				<p className="text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground">
					The people behind Timverse
				</p>
				<h1 className="font-serif text-5xl font-semibold tracking-tight text-foreground">
					Meet the Team
				</h1>
				<p className="max-w-xl text-base leading-relaxed text-muted-foreground">
					A collaboration between timber engineering research and software
					development — built at the University of Toronto.
				</p>
			</div>

			<div>
				{teamMembers.map((member) => (
					<MemberCard
						key={member.name}
						name={member.name}
						title={member.title}
						description={member.description}
						image={member.image}
						initials={member.initials}
					/>
				))}
			</div>

			<div className="mt-8 md:mt-16">
				<p className="mb-4 text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground">
					Supported by
				</p>

				<div className="grid gap-3 sm:grid-cols-2">
					{supportingOrganizations.map((organization) => (
						<SupportCard
							key={organization.name}
							href={organization.href}
							ariaLabel={organization.ariaLabel}
							logo={organization.logo}
							logoAlt={organization.logoAlt}
							logoClassName={organization.logoClassName}
						/>
					))}
				</div>

				<p className="mt-3 rounded-xl border border-border bg-card px-5 py-4 text-sm leading-relaxed text-muted-foreground">
					This project is supported by the{" "}
					<a
						href={supportingOrganizations[0].href}
						target="_blank"
						rel="noreferrer"
						className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/70"
					>
						Department of Civil and Mineral Engineering
					</a>
					, and the{" "}
					<a
						href={supportingOrganizations[1].href}
						target="_blank"
						rel="noreferrer"
						className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/70"
					>
						Data Sciences Institute
					</a>{" "}
					at the University of Toronto.
				</p>
			</div>
		</div>
	);
}
