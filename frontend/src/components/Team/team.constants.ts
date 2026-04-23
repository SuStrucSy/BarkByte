import civilEngineeringLogo from "@/assets/branding/civil_and_mineral_engineering_logo.webp";
import dsiLogo from "@/assets/branding/dsi_logo.webp";
import amirhosseinHeidariPhoto from "@/assets/team/amirhossein-heidari.jpg";
import aryanRezaeiRadPhoto from "@/assets/team/aryan-rezaei-rad.jpg";
import danielRazaviPhoto from "@/assets/team/daniel-razavi.jpg";
import wisamAlAbedPhoto from "@/assets/team/wisam-al-abed.jpg";

export const teamMembers = [
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
] as const;

export const supportingOrganizations = [
	{
		name: "Civil and Mineral Engineering",
		href: "https://civmin.utoronto.ca/",
		ariaLabel: "Visit the Civil and Mineral Engineering website",
		logo: civilEngineeringLogo,
		logoAlt: "Civil Engineering logo",
		logoClassName: "h-28 w-auto object-contain",
	},
	{
		name: "Data Sciences Institute",
		href: "https://datasciences.utoronto.ca/",
		ariaLabel: "Visit the Data Sciences Institute website",
		logo: dsiLogo,
		logoAlt: "Data Sciences Institute logo",
		logoClassName: "h-24 w-auto object-contain",
	},
] as const;
