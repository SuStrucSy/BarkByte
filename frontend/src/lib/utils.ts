import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function renderValue(value: any): string {
	if (value === null || value === undefined || value === "") {
		return "—";
	}
	if (typeof value === "boolean") {
		return value ? "Yes" : "No";
	}
	if (typeof value === "string") {
		return value
	}
	if (Array.isArray(value)) {
		return value.map((v) => renderValue(v)).join(", ");
	}
	return value?.label || "—"
}


export function humanizeLabel(label: string): string {
  return label
    .replace(/^e_/, "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}