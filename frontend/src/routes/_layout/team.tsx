import { createFileRoute } from "@tanstack/react-router";
import civilEngineeringLogo from "@/assets/branding/civil_and_mineral_engineering_logo.svg";
import dsiLogo from "@/assets/branding/dsi_logo.svg";
import amirhosseinHeidariPhoto from "@/assets/team/amirhossein-heidari.jpg";
import aryanRezaeiRadPhoto from "@/assets/team/aryan-rezaei-rad.jpg";
import danielRazaviPhoto from "@/assets/team/daniel-razavi.jpg";
import wisamAlAbedPhoto from "@/assets/team/wisam-al-abed.jpg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    image: aryanRezaeiRadPhoto,
    index: "01",
  },
  {
    name: "Amirhossein Heidari",
    title: "PhD Candidate, Research Assistant",
    description:
      "Led the logic design behind Timverse, including database architecture and the organization of test data.",
    initials: "AH",
    image: amirhosseinHeidariPhoto,
    index: "02",
  },
  {
    name: "Wisam Al Abed",
    title: "Senior Software Developer, Data Sciences Institute",
    description:
      "Worked on the frontend, deployment, infrastructure as code, and platform setup, while also contributing to the database work.",
    initials: "WA",
    image: wisamAlAbedPhoto,
    index: "03",
  },
  {
    name: "Daniel Razavi",
    title: "Senior Software Developer, Data Sciences Institute",
    description:
      "Built core backend and frontend parts of Timverse and worked on the database design and implementation across the project.",
    initials: "DR",
    image: danielRazaviPhoto,
    index: "04",
  },
];

function TeamPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Hero */}
      <div className="mb-12 space-y-3">
        <p className="text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground">
          The people behind Timverse
        </p>
        <h1 className="font-serif text-5xl font-semibold tracking-tight text-foreground">
          Meet the Team
        </h1>
        <p className="max-w-xl text-base text-muted-foreground leading-relaxed">
          A collaboration between timber engineering research and software
          development — built at the University of Toronto.
        </p>
      </div>

      {/* Member rows */}
      <div>
        {teamMembers.map((member) => (
          <div
            key={member.name}
            className="group grid grid-cols-[4rem_1fr] items-start gap-x-12 border-b border-border py-7 first:border-t transition-colors hover:bg-muted/40 px-2 -mx-2 rounded-sm"
          >
            {/* Avatar */}
            <Avatar className="size-25 border border-border">
              <AvatarImage
                src={member.image}
                alt={member.name}
                className="object-cover"
              />
              <AvatarFallback className="text-xs font-medium tracking-wide">
                {member.initials}
              </AvatarFallback>
            </Avatar>

            {/* Text */}
            <div>
              <p className="mb-1 font-serif text-xl font-semibold text-foreground leading-tight">
                {member.name}
              </p>
              <p className="mb-3 text-[0.7rem] font-medium tracking-widest uppercase text-muted-foreground">
                {member.title}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground max-w-prose">
                {member.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Institutions */}
      <div className="mt-16">
        <p className="mb-4 text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground">
          Supported by
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <a
            href="https://civmin.utoronto.ca/"
            target="_blank"
            rel="noreferrer"
            aria-label="Visit the Civil and Mineral Engineering website"
            className="flex min-h-36 items-center justify-center rounded-xl border border-border bg-card p-8 transition-colors hover:bg-muted/50 hover:border-foreground/20"
          >
            <img
              src={civilEngineeringLogo}
              alt="Civil Engineering logo"
              className="h-28 w-auto object-contain"
            />
          </a>

          <a
            href="https://datasciences.utoronto.ca/"
            target="_blank"
            rel="noreferrer"
            aria-label="Visit the Data Sciences Institute website"
            className="flex min-h-36 items-center justify-center rounded-xl border border-border bg-card p-8 transition-colors hover:bg-muted/50 hover:border-foreground/20"
          >
            <img
              src={dsiLogo}
              alt="Data Sciences Institute logo"
              className="h-24 w-auto object-contain"
            />
          </a>
        </div>

        <p className="mt-3 rounded-xl border border-border bg-card px-5 py-4 text-sm leading-relaxed text-muted-foreground">
          This project is supported by the{" "}
          <a
            href="https://civmin.utoronto.ca/"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/70"
          >
            Department of Civil and Mineral Engineering
          </a>
          , and the{" "}
          <a
            href="https://datasciences.utoronto.ca/"
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
