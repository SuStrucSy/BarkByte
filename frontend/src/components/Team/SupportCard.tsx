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
			className="flex min-h-36 items-center justify-center rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-muted/50 md:p-8"
		>
			<div className="rounded-lg dark:bg-white dark:p-3">
				<img src={logo} alt={logoAlt} className={logoClassName} />
			</div>
		</a>
	);
}
