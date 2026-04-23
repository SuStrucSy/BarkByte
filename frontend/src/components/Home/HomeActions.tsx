import { Link } from "@tanstack/react-router";
import { ChartSpline, Layers, Mail, Users } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function HomeActions() {
	return (
		<nav className="flex flex-wrap items-center gap-2">
			<Button asChild>
				<Link to="/specimens">
					<Layers className="h-3.5 w-3.5" />
					<span className="hidden md:inline">Browse Specimens</span>
				</Link>
			</Button>

			<Button asChild variant="secondary" size="sm">
				<Link to="/dashboard">
					<ChartSpline className="h-3.5 w-3.5" />
					<span className="hidden md:inline">Dashboard</span>
				</Link>
			</Button>

			<div className="ml-1 flex items-center gap-0.5">
				<IconButton href="/team" label="Team" isInternal Icon={Users} />
				<IconButton
					href="mailto:aryan.rad@utoronto.ca"
					label="Contact"
					Icon={Mail}
				/>
				<IconButton
					href="https://github.com/SuStrucSy/BarkByte"
					label="GitHub repository"
				>
					<GitHubIcon className="h-3.5 w-3.5 fill-current" />
				</IconButton>
			</div>
		</nav>
	);
}

type IconButtonProps = {
	href: string;
	label: string;
	children?: ReactNode;
	Icon?: ComponentType<{ className?: string }>;
	isInternal?: boolean;
};

function IconButton({
	href,
	label,
	children,
	Icon,
	isInternal = false,
}: IconButtonProps) {
	const content = children ?? (Icon ? <Icon className="h-3.5 w-3.5" /> : null);

	if (isInternal) {
		return (
			<Button asChild size="sm" variant="ghost">
				<Link to={href} aria-label={label}>
					{content}
				</Link>
			</Button>
		);
	}

	return (
		<Button asChild size="sm" variant="ghost">
			<a
				href={href}
				aria-label={label}
				target={href.startsWith("http") ? "_blank" : undefined}
				rel={href.startsWith("http") ? "noreferrer" : undefined}
			>
				{content}
			</a>
		</Button>
	);
}

function GitHubIcon({ className }: { className?: string }) {
	return (
		<svg
			role="img"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<title>GitHub</title>
			<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
		</svg>
	);
}
