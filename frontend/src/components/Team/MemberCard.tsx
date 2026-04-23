import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type MemberCardProps = {
	name: string;
	title: string;
	description: string;
	image: string;
	initials: string;
};

export function MemberCard({
	name,
	title,
	description,
	image,
	initials,
}: MemberCardProps) {
	return (
		<div className="group -mx-2 grid grid-cols-[4rem_1fr] items-start gap-x-12 border-b border-border px-2 py-7 transition-colors first:border-t hover:bg-muted/40">
			<Avatar className="size-25 border border-border">
				<AvatarImage src={image} alt={name} className="object-cover" />
				<AvatarFallback className="text-xs font-medium tracking-wide">
					{initials}
				</AvatarFallback>
			</Avatar>

			<div>
				<p className="mb-1 font-serif text-xl font-semibold leading-tight text-foreground">
					{name}
				</p>
				<p className="mb-3 text-[0.7rem] font-medium tracking-widest uppercase text-muted-foreground">
					{title}
				</p>
				<p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
					{description}
				</p>
			</div>
		</div>
	);
}
