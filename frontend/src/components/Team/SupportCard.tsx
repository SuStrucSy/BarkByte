import { cn } from "@/lib/utils";

type SupportCardProps = {
	href: string;
	ariaLabel: string;
	logo: string;
	logoAlt: string;
	logoClassName: string;
};

export function SupportCard({
	href,
	ariaLabel,
	logo,
	logoAlt,
	logoClassName,
}: SupportCardProps) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noreferrer"
			aria-label={ariaLabel}
			className={cn(
				"flex min-h-36 items-center justify-center rounded-xl border border-border bg-card p-4 transition-colors",
				"md:p-8",
				"hover:border-foreground/20 hover:bg-muted/50",
			)}
		>
			<div className="rounded-lg dark:bg-white dark:p-3">
				<img src={logo} alt={logoAlt} className={logoClassName} />
			</div>
		</a>
	);
}
