import { EXPERIMENTAL_KEYS, getExperimentalLabel } from "@/lib/constants";
import type { DonutCardMode } from "./DonutCard";

export const BOX_PLOT_LABELS = EXPERIMENTAL_KEYS.map((key) => ({
	key,
	label: getExperimentalLabel(key),
}));

export const DONUT_CARD_CONFIGS: Array<{
	title: string;
	description: string;
	mode: DonutCardMode;
}> = [
	{
		title: "Specimens by Joinery Type",
		description: "How specimens are distributed across joinery types",
		mode: "joinery",
	},
	{
		title: "Specimens by Fastener Type",
		description: "How specimens are distributed across fastener types",
		mode: "fastener",
	},
	{
		title: "Specimens by Loading Direction",
		description: "How specimens are distributed across loading directions",
		mode: "loadingDirection",
	},
	{
		title: "Specimens by Assembly Type",
		description: "How specimens are distributed across assembly types",
		mode: "assembly",
	},
	{
		title: "Specimens by Sub-Joinery Type",
		description: "How specimens are distributed across sub-joinery types",
		mode: "subjoinery",
	},
];

export function getDefaultFastener(fastenerTypes: string[]) {
	return (
		fastenerTypes.find((fastener) => fastener.toLowerCase() === "screw") ||
		fastenerTypes.find((fastener) =>
			fastener.toLowerCase().includes("screw"),
		) ||
		fastenerTypes[0]
	);
}
