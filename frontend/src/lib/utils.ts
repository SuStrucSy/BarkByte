import type {
  FastenerTypes,
  SpecimenPublic,
  SpecimensPublic,
} from "@/api/model";
import { type ClassValue, clsx } from "clsx";
import * as d3 from "d3";
import { twMerge } from "tailwind-merge";
import { isNumericValue } from "./typeGuards";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function groupSpecimensByFastener(
  specimensPublic: SpecimensPublic,
  fastenerTypes: FastenerTypes | undefined,
): Record<string, SpecimenPublic[]> {
  // Create fastener ID -> label lookup map (id is optional but exists in data)
  const fastenerMap = new Map(
    fastenerTypes?.data.map((f) => [f.id!, f.label] as [string, string]),
  );

  return specimensPublic.data.reduce(
    (acc, specimen) => {
      // API stores full FastenerType objects OR empty array, never raw IDs
      const fastenerObj = specimen.fastener_types?.[0];
      const groupKey =
        fastenerObj?.id && fastenerMap.has(fastenerObj.id)
          ? fastenerMap.get(fastenerObj.id)!
          : "Dowel-Free";

      acc[groupKey] ??= [];
      acc[groupKey].push(specimen);
      return acc;
    },
    {} as Record<string, SpecimenPublic[]>,
  );
}

// Get chart colors from CSS variables - they're in oklch format
export const getChartColors = () => {
  if (typeof window === "undefined") return [];
  const style = getComputedStyle(document.documentElement);
  return [
    style.getPropertyValue("--chart-1").trim(),
    style.getPropertyValue("--chart-2").trim(),
    style.getPropertyValue("--chart-3").trim(),
    style.getPropertyValue("--chart-4").trim(),
    style.getPropertyValue("--chart-5").trim(),
  ].map((color) => (color.startsWith("oklch") ? color : `oklch(${color})`));
};

export interface SummaryStats {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  count: number;
}

export const getSummaryStats = (data: number[]): SummaryStats | null => {
  if (!data || data.length === 0) {
    console.warn("getSummaryStats: Empty data array");
    return null;
  }

  const validData = data.filter(isNumericValue);

  if (validData.length === 0) {
    console.warn("getSummaryStats: No valid numeric data");
    return null;
  }

  const sortedData = validData.sort((a, b) => a - b);

  const q1 = d3.quantile(sortedData, 0.25);
  const median = d3.quantile(sortedData, 0.5);
  const q3 = d3.quantile(sortedData, 0.75);

  if (q1 == null || median == null || q3 == null) {
    console.warn("getSummaryStats: Failed to calculate quantiles");
    return null;
  }

  const interQuantileRange = q3 - q1;
  const min = q1 - 1.5 * interQuantileRange;
  const max = q3 + 1.5 * interQuantileRange;

  return { min, q1, median, q3, max, count: validData.length };
};

export function renderValue(value: any): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return value.map((v) => renderValue(v)).join(", ");
  }
  return value?.label || "—";
}

export function humanizeLabel(label: string): string {
  return label
    .replace(/^e_/, "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getInitials(fullName: string): string {
  // Trim, split on spaces, and remove empty parts
  const parts = fullName.trim().split(" ").filter(Boolean);

  // Take first letter of first and last "words"
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0][0].toUpperCase();

  const first = parts[0][0].toUpperCase();
  const last = parts[parts.length - 1][0].toUpperCase();

  return first + last;
}
