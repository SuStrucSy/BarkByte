import type { SpecimenPublic } from "@/api/model";

// Extract all e_ keys from SpecimenPublic
type SpecimenExperimentalKey = Extract<keyof SpecimenPublic, `e_${string}`>;

// satisfies ensures every key is a real SpecimenPublic field,
// without requiring all e_ keys to be present
const EXPERIMENTAL_DATA = {
  e_stiffness: { label: "Stiffness", unit: "kN/mm" },
  e_yield_force: { label: "Yield Strength", unit: "kN" },
  e_yield_displacement: { label: "Yield Displacement", unit: "mm" },
  e_max_force: { label: "Max Force", unit: "kN" },
  e_max_displacement: { label: "Max Displacement", unit: "mm" },
  e_ultimate_force: { label: "Ultimate Force", unit: "kN" },
  e_ultimate_displacement: { label: "Ultimate Displacement", unit: "mm" },
  e_ductility: { label: "Ductility", unit: "" },
} satisfies Partial<
  Record<SpecimenExperimentalKey, { label: string; unit: string }>
>;

export type ExperimentalKey = keyof typeof EXPERIMENTAL_DATA;
export const EXPERIMENTAL_KEYS = Object.keys(
  EXPERIMENTAL_DATA,
) as ExperimentalKey[];

export const getExperimentalLabel = (key: ExperimentalKey) =>
  EXPERIMENTAL_DATA[key].label;

export const getExperimentalUnit = (key: ExperimentalKey) =>
  EXPERIMENTAL_DATA[key].unit;

export const getFullLabel = (key: ExperimentalKey) => {
  const { label, unit } = EXPERIMENTAL_DATA[key];
  return unit ? `${label} (${unit})` : label;
};
// ============================================
// THEME PROVIDER CONSTANTS
// ============================================
//
export const modes = ["light", "dark", "system"] as const;
// constants.ts
export const themes = [
  "default",
  "timber",
  "stone",
  "zinc",
  "gray",
  "slate",
  "blueprint",
  "birch",
  "concrete",
  "forest",
  "charcoal",
  "nordic",
  "pacific",
  "carbon",
  "macos",
  "forest-night",
] as const;

export const THEME_COLORS: Record<string, string> = {
  default: "bg-neutral-400",
  timber: "bg-amber-700",
  stone: "bg-stone-500",
  zinc: "bg-zinc-500",
  gray: "bg-gray-500",
  slate: "bg-slate-500",
  blueprint: "bg-blue-700",
  birch: "bg-yellow-100 border border-yellow-300",
  concrete: "bg-slate-400",
  forest: "bg-green-700",
  charcoal: "bg-neutral-600",
  nordic: "bg-sky-300",
  pacific: "bg-teal-600",
  carbon: "bg-neutral-800",
  macos: "bg-blue-500",
  "forest-night": "bg-green-900",
};

export const THEME_TEXT_COLORS: Record<string, string> = {
  default: "text-neutral-400",
  timber: "text-yellow-800",
  stone: "text-stone-500",
  zinc: "text-zinc-500",
  gray: "text-gray-500",
  slate: "text-slate-500",
  blueprint: "text-blue-700",
  birch: "text-yellow-600",
  concrete: "text-slate-400",
  forest: "text-green-700",
  charcoal: "text-neutral-600",
  nordic: "text-sky-400",
  pacific: "text-teal-600",
  carbon: "text-neutral-500",
  macos: "text-blue-500",
  "forest-night": "text-green-900",
};

// ============================================
// SPECIMEN CONSTANTS
// ============================================
export const ASSEMBLY_TYPES = [
  "Wall-Floor",
  "Wall-Wall",
  "Wall-Floor & Wall-Wall",
] as const;
