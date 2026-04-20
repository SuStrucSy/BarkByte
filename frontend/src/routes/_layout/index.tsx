import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Users, ExternalLink, ChartSpline, Layers } from "lucide-react";
import joineryOverview from "@/assets/joineryTypes/all.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Route = createFileRoute("/_layout/")({
  staticData: {
    title: "Home",
  },
  component: Home,
});

const joineryHotspots = [
  {
    id: "hold-down",
    label: "Hold-Down",
    description: "Steel hold-down hardware anchoring the panel near the base.",
    left: "18%",
    top: "48%",
  },
  {
    id: "angle-bracket",
    label: "Angle Bracket",
    description: "Steel angle bracket anchoring the panel near the base.",
    left: "25%",
    top: "58%",
  },
  {
    id: "plate-floor",
    label: "Plate Connection",
    description:
      "Base plate detail connecting the timber element to the floor.",
    left: "88%",
    top: "70%",
  },
  {
    id: "plate-wall",
    label: "Plate Connection",
    description:
      "Base plate detail connecting the timber element to another wall.",
    left: "42%",
    top: "25%",
  },
  {
    id: "spline",
    label: "Spline Joint",
    description:
      "A central spline-style vertical connection bridging timber members.",
    left: "70%",
    top: "30%",
  },
  {
    id: "slot",
    label: "Slot Joint",
    description:
      "Interlocking slotted timber profile along the right panel edge.",
    left: "43%",
    top: "15%",
  },
  {
    id: "through-tenon",
    label: "Through Tenon",
    description:
      "Tenon-like base engagement visible where the upright member meets the platform.",
    left: "71%",
    top: "68%",
  },
] as const;

function Home() {
  return (
    <div className="flex items-center justify-center overflow p-4 mt-4 md:mt-10 lg:mt-14">
      <Card className="w-full max-w-6xl overflow-hidden border-border/60 shadow-2xl">
        <CardContent className="grid gap-0 p-0 lg:grid-cols-[1fr_1.25fr]">
          {/* ── Left: content panel ── */}
          <div className="flex flex-col justify-between gap-8 p-8 md:p-10 lg:p-12">
            <div className="space-y-6">
              {/* Brand name — small, sets context before the headline */}
              <div className="flex items-center gap-2">
                <span className="h-px w-5 bg-border" />
                <span className="font-serif text-sm italic text-muted-foreground">
                  Timverse
                </span>
              </div>

              {/* Headline — value proposition, not the product name */}
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl leading-tight">
                  Curated experimental data on mass timber connections
                </h1>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-[0.95rem]">
                  Browse specimens by joinery type, material, and failure mode.
                  Trace from connection detail to test conditions and outcomes —
                  without digging through disconnected notes and spreadsheets.
                </p>
              </div>

              {/* Stat strip */}
              <div className="flex items-center gap-4 border-t border-border pt-5">
                <div className="shrink-0 text-center">
                  <p className="text-2xl font-semibold tracking-tight text-foreground">
                    7
                  </p>
                  <p className="text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                    Joinery types
                  </p>
                </div>
                <div className="h-8 w-px shrink-0 bg-border" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Each hotspot on the diagram links to a connection family
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* Primary */}
                <Button asChild>
                  <Link to="/specimens">
                    <Layers className="h-3.5 w-3.5" />
                    Browse Specimens
                  </Link>
                </Button>

                {/* Secondary */}
                <Button asChild variant="secondary" size="sm">
                  <Link to="/dashboard">
                    <ChartSpline className="h-3.5 w-3.5" />
                    Dashboard
                  </Link>
                </Button>

                {/* Tertiary — icon-only, visually recede */}
                <div className="ml-1 flex items-center gap-0.5">
                  <Button asChild size="sm" variant="ghost">
                    <Link to="/team" aria-label="Team">
                      <Users className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <a href="mailto:aryan.rad@utoronto.ca" aria-label="Contact">
                      <Mail className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <a
                      href="https://github.com/SuStrucSy/BarkByte"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="GitHub repository"
                    >
                      <svg
                        role="img"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5 fill-current"
                      >
                        <title>GitHub</title>
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                      </svg>
                    </a>
                  </Button>
                </div>
              </div>

              <p className="text-[0.65rem] leading-relaxed text-muted-foreground/60">
                University of Toronto · Civil & Mineral Engineering · Data
                Sciences Institute
              </p>
            </div>
          </div>

          {/* ── Right: interactive image panel ── */}
          <div className="relative min-h-110 border-t border-border/60 bg-muted/30 lg:min-h-full lg:border-t-0 lg:border-l">
            {/* Subtle grid texture */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg,currentColor,currentColor 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,currentColor,currentColor 1px,transparent 1px,transparent 40px)",
              }}
            />

            {/* Corner label */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-md border border-border/60 bg-background/80 px-2.5 py-1 backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-viz-3" />
              <span className="text-[0.6rem] font-medium tracking-widest uppercase text-muted-foreground">
                {joineryHotspots.length} connections mapped
              </span>
            </div>

            <div className="relative flex h-full items-center justify-center p-6 md:p-8">
              <div className="w-full overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-xl backdrop-blur-sm">
                <div className="relative">
                  <img
                    src={joineryOverview}
                    alt="Overview sheet of timber joinery types"
                    className="h-auto w-full object-contain"
                  />
                  {joineryHotspots.map((hotspot) => (
                    <Tooltip key={hotspot.id}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-viz-3 shadow-[0_0_0_6px_color-mix(in_srgb,var(--viz-2)_18%,transparent)] transition-transform hover:scale-125 focus-visible:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          style={{ left: hotspot.left, top: hotspot.top }}
                          aria-label={`${hotspot.label}: ${hotspot.description}`}
                        >
                          <span className="absolute inset-0 animate-ping rounded-full bg-viz-2 opacity-35" />
                          <span className="absolute inset-0.75 rounded-full bg-background/85" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-56">
                        <div className="space-y-1">
                          <p className="font-medium">{hotspot.label}</p>
                          <p className="text-muted text-xs">
                            {hotspot.description}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>

                {/* Image footer */}
                <div className="flex items-center justify-between border-t border-border/50 px-4 py-2.5">
                  <p className="text-xs text-muted-foreground">
                    Hover a hotspot to identify the connection type
                  </p>
                  <ExternalLink className="h-3 w-3 text-muted-foreground/50" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
