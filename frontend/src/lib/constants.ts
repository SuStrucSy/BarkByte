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
export const themes = ["neutral", "stone", "zinc", "gray", "slate"] as const;

// ============================================
// SPECIMEN CONSTANTS
// ============================================
export const ASSEMBLY_TYPES = [
  "Wall-Floor",
  "Wall-Wall",
  "Wall-Floor & Wall-Wall",
] as const;
