// ============================================
// EXPERIMENTAL DATA CONSTANTS
// ============================================

// 1. Labels (display names)
export const EXPERIMENTAL_LABELS = {
  e_stiffness: "Stiffness (Ks)",
  e_yield_force: "Yield Strength (Fy)",
  e_ductility: "Ductility (μ)",
} as const;

// 2. Units (separate)
export const EXPERIMENTAL_UNITS = {
  e_stiffness: "KN/mm",
  e_yield_force: "KN",
  e_ductility: "%",
} as const;

export const EXPERIMENTAL_KEYS = [
  "e_stiffness",
  "e_yield_force",
  "e_ductility",
] as const;

// ============================================
// TYPE EXPORTS (must come before helpers)
// ============================================
export type ExperimentalKey = (typeof EXPERIMENTAL_KEYS)[number];

// ============================================
// UTILITY HELPERS (now fully type-safe)
// ============================================

export const getExperimentalLabel = (key: ExperimentalKey): string => {
  return (
    EXPERIMENTAL_LABELS[key as keyof typeof EXPERIMENTAL_LABELS] ?? String(key)
  );
};

export const getExperimentalUnit = (key: ExperimentalKey): string => {
  return EXPERIMENTAL_UNITS[key as keyof typeof EXPERIMENTAL_UNITS];
};

export const getFullLabel = (key: ExperimentalKey): string =>
  `${EXPERIMENTAL_LABELS[key as keyof typeof EXPERIMENTAL_LABELS]} (${EXPERIMENTAL_UNITS[key as keyof typeof EXPERIMENTAL_UNITS]})`;
