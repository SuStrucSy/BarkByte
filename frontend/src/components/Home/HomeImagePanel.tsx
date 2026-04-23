import joineryOverview from "@/assets/joineryTypes/all.png";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { imagePanelGridStyle, joineryHotspots } from "./home.constants";

export function HomeImagePanel() {
	return (
		<aside className="relative hidden border-t border-border/60 bg-muted/30 lg:block lg:border-t-0 lg:border-l">
			<div
				className="absolute inset-0 opacity-[0.03]"
				style={imagePanelGridStyle}
			/>

			<figure className="relative flex h-full items-center justify-center p-5 lg:p-6 xl:p-8">
				<div className="w-full overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-xl backdrop-blur-sm">
					<div className="relative">
						<img
							src={joineryOverview}
							alt="Overview sheet of timber joinery types"
							className="h-auto w-full object-contain"
						/>
						{joineryHotspots.map((hotspot) => (
							<JoineryHotspot key={hotspot.id} {...hotspot} />
						))}
					</div>

					<figcaption className="border-t border-border/50 px-4 py-2.5 text-xs text-muted-foreground">
						Hover a hotspot to identify the connection type
					</figcaption>
				</div>
			</figure>
		</aside>
	);
}

type JoineryHotspotProps = (typeof joineryHotspots)[number];

function JoineryHotspot({ label, description, position }: JoineryHotspotProps) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-viz-3 shadow-[0_0_0_6px_color-mix(in_srgb,var(--viz-2)_18%,transparent)] transition-transform hover:scale-125 focus-visible:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					style={position}
					aria-label={`${label}: ${description}`}
				>
					<span className="absolute inset-0 animate-ping rounded-full bg-viz-2 opacity-35" />
					<span className="absolute inset-0.75 rounded-full bg-background/85" />
				</button>
			</TooltipTrigger>
			<TooltipContent side="top" className="max-w-56">
				<div className="space-y-1">
					<p className="font-medium">{label}</p>
					<p className="text-muted text-xs">{description}</p>
				</div>
			</TooltipContent>
		</Tooltip>
	);
}
