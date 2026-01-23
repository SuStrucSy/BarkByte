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

