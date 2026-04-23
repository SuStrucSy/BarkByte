import { createFileRoute } from "@tanstack/react-router";
import { HomeActions } from "@/components/Home/HomeActions";
import { HomeImagePanel } from "@/components/Home/HomeImagePanel";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_layout/")({
	staticData: {
		title: "Home",
	},
	component: Home,
});

function Home() {
	return (
		<div className="flex min-h-[calc(100svh-7rem)] items-center justify-center p-4 md:min-h-[calc(100svh-10rem)] md:p-0 lg:min-h-[calc(100svh-12rem)]">
			<Card className="w-full max-w-6xl overflow-hidden border-border/60 py-0 shadow-2xl md:w-auto md:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
				<CardContent className="grid gap-0 p-0 lg:grid-cols-[1.2fr_0.8fr] xl:grid-cols-[1fr_1.25fr]">
					<section className="flex flex-col gap-2 p-6 md:gap-8 md:p-10 lg:p-8 xl:p-12">
						<header className="space-y-3 md:space-y-6">
							<div className="flex items-center gap-2">
								<span className="h-px w-5 bg-border" />
								<span className="font-serif text-sm italic text-muted-foreground">
									Timverse
								</span>
							</div>
							<h1 className="text-2xl font-semibold leading-tight tracking-tight text-foreground md:text-2xl lg:text-4 xl:text-4xl">
								Curated experimental data on mass timber connections
							</h1>
							<p className="text-sm leading-relaxed text-muted-foreground md:text-[0.95rem]">
								Browse specimens by joinery type, material, and failure mode.
								Trace from connection detail to test conditions and outcomes
								without digging through disconnected notes and spreadsheets.
							</p>
						</header>
						<HomeActions />
						<p className="text-[0.65rem] leading-relaxed text-muted-foreground/60">
							University of Toronto · Civil & Mineral Engineering · Data
							Sciences Institute
						</p>
					</section>
					<HomeImagePanel />
				</CardContent>
			</Card>
		</div>
	);
}
