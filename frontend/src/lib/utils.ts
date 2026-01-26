import type {
  FastenerTypes,
  SpecimenPublic,
  SpecimensPublic,
} from "@/api/model";
import { type ClassValue, clsx } from "clsx";
import * as d3 from "d3";
import { twMerge } from "tailwind-merge";

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

// Takes an array of numbers and compute some summary statistics from it like quantiles, median..
// Those summary statistics are the info needed to draw a boxplot
export const getSummaryStats = (data: number[]) => {
  const sortedData = data.sort(function (a, b) {
    return a - b;
  });

  const q1 = d3.quantile(sortedData, 0.25);
  const median = d3.quantile(sortedData, 0.5);
  const q3 = d3.quantile(sortedData, 0.75);

  if (!q3 || !q1 || !median) {
    return;
  }

  const interQuantileRange = q3 - q1;
  const min = q1 - 1.5 * interQuantileRange;
  const max = q3 + 1.5 * interQuantileRange;

  return { min, q1, median, q3, max };
};
