import { Link } from "@tanstack/react-router";
import { CheckCircle2, CircleX, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type VerifyEmailComponentProps = {
	icon: "loading" | "success" | "failure" | "email";
	title: string;
	message: string;
	action?:
		| { label: string; to: string; onClick?: never }
		| { label: string; onClick: () => void; to?: never };
};

export function VerifyEmailComponent({
	icon,
	title,
	message,
	action,
}: VerifyEmailComponentProps) {
	const iconConfig = {
		success: {
			wrapper: "bg-emerald-500/10",
			icon: <CheckCircle2 className="size-7 text-emerald-600" />,
		},
		failure: {
			wrapper: "bg-red-500/10",
			icon: <CircleX className="size-7 text-red-600" />,
		},
		email: {
			wrapper: "bg-muted",
			icon: <Mail className="size-6 text-muted-foreground" />,
		},
		loading: {
			wrapper: "bg-muted",
			icon: <Loader2 className="size-5 animate-spin text-muted-foreground" />,
		},
	} as const;
	const baseClasses =
		"mb-5 flex size-14 items-center justify-center rounded-full";
	const config = iconConfig[icon];

	return (
		<div className="flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
			<div className="relative w-full max-w-md">
				<svg
					className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]"
					role="img"
					aria-label="Subtle grain texture"
				>
					<filter id="verify-grain">
						<feTurbulence
							type="fractalNoise"
							baseFrequency="0.65"
							numOctaves="3"
							stitchTiles="stitch"
						/>
						<feColorMatrix type="saturate" values="0" />
					</filter>
					<rect width="100%" height="100%" filter="url(#verify-grain)" />
				</svg>
				<Card className="relative border bg-card shadow-sm">
					<CardContent className="flex flex-col items-center px-6 py-8 text-center">
						<div className={`${baseClasses} ${config.wrapper}`}>
							{config.icon}
						</div>
						<h1 className="text-2xl font-bold tracking-tight text-foreground">
							{title}
						</h1>
						<p className="mt-3 text-sm leading-6 text-muted-foreground">
							{message}
						</p>
						{action && (
							<div className="mt-6">
								{action.to ? (
									<Button asChild>
										<Link to={action.to}>{action.label}</Link>
									</Button>
								) : (
									<Button onClick={action.onClick}>{action.label}</Button>
								)}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
