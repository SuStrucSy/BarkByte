import type { CSSProperties } from "react";

export const imagePanelGridStyle = {
	backgroundImage:
		"repeating-linear-gradient(0deg,currentColor,currentColor 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,currentColor,currentColor 1px,transparent 1px,transparent 40px)",
} satisfies CSSProperties;

export const joineryHotspots = [
	{
		id: "hold-down",
		label: "Hold-Down",
		description: "Steel hold-down hardware anchoring the panel near the base.",
		position: { left: "18%", top: "48%" },
	},
	{
		id: "angle-bracket",
		label: "Angle Bracket",
		description: "Steel angle bracket anchoring the panel near the base.",
		position: { left: "25%", top: "58%" },
	},
	{
		id: "plate-floor",
		label: "Plate Connection",
		description:
			"Base plate detail connecting the timber element to the floor.",
		position: { left: "88%", top: "70%" },
	},
	{
		id: "plate-wall",
		label: "Plate Connection",
		description:
			"Base plate detail connecting the timber element to another wall.",
		position: { left: "42%", top: "25%" },
	},
	{
		id: "spline",
		label: "Spline Joint",
		description:
			"A central spline-style vertical connection bridging timber members.",
		position: { left: "70%", top: "30%" },
	},
	{
		id: "slot",
		label: "Slot Joint",
		description:
			"Interlocking slotted timber profile along the right panel edge.",
		position: { left: "43%", top: "15%" },
	},
	{
		id: "through-tenon",
		label: "Through Tenon",
		description:
			"Tenon-like base engagement visible where the upright member meets the platform.",
		position: { left: "71%", top: "68%" },
	},
] as const;
