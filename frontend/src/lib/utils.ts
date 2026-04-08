import type { AxiosError } from "axios";
import { type ClassValue, clsx } from "clsx";
import * as d3 from "d3";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import type {
	FastenerTypes,
	HTTPValidationError,
	SpecimenPublic,
	SpecimensPublic,
} from "@/api/model";
import type { FastenerType } from "@/api/model/fastenerType";
import { isNumericValue } from "./typeGuards";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function groupSpecimensByFastener(
	specimensPublic: SpecimensPublic,
	fastenerTypes: FastenerTypes | undefined,
): Record<string, SpecimenPublic[]> {
	// Create fastener ID -> label lookup map (id is optional but exists in data)
	const fastenerMap = new Map<string, string>(
		fastenerTypes?.data.map(
			(f: FastenerType) => [f.id, f.label] as [string, string],
		),
	);

	return specimensPublic.data.reduce(
		(acc: Record<string, SpecimenPublic[]>, specimen: SpecimenPublic) => {
			// API stores full FastenerType objects OR empty array, never raw IDs
			const fastenerObj = specimen.fastener_types?.[0];
			const groupKey: string =
				(fastenerObj?.id && fastenerMap.get(fastenerObj.id)) || "Dowel-Free";

			acc[groupKey] ??= [];
			acc[groupKey].push(specimen);
			return acc;
		},
		{} as Record<string, SpecimenPublic[]>,
	);
}

export type ItemCount = {
	label: string;
	count: number;
};

export function countByAttribute(
	specimens: SpecimenPublic[],
	getLabel: (specimen: SpecimenPublic) => string,
): Record<string, ItemCount> {
	return specimens.reduce<Record<string, ItemCount>>((acc, specimen) => {
		const label = getLabel(specimen);
		acc[label] = { label, count: (acc[label]?.count ?? 0) + 1 };
		return acc;
	}, {});
}

export function countByArrayAttribute(
	specimens: SpecimenPublic[],
	getLabels: (specimen: SpecimenPublic) => string[],
	fallback?: string,
): Record<string, ItemCount> {
	return specimens.reduce<Record<string, ItemCount>>((acc, specimen) => {
		const labels = getLabels(specimen);
		const effective = labels.length > 0 ? labels : fallback ? [fallback] : [];

		for (const label of effective) {
			acc[label] = { label, count: (acc[label]?.count ?? 0) + 1 };
		}
		return acc;
	}, {});
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

export function parseMoisturePercentage(
	value: string | null | undefined,
): number | null {
	const normalized = String(value ?? "")
		.trim()
		.replace(/%$/, "");

	if (!normalized) {
		return null;
	}

	const parsed = Number(normalized);
	return Number.isFinite(parsed) ? parsed : null;
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

export const emailPattern = {
	value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
	message: "Invalid email address",
};

export const namePattern = {
	value: /^[A-Za-z\s\u00C0-\u017F]{1,30}$/,
	message: "Invalid name",
};

export const passwordRules = (isRequired = true) => {
	const rules: any = {
		minLength: {
			value: 8,
			message: "Password must be at least 8 characters",
		},
	};

	if (isRequired) {
		rules.required = "Password is required";
	}

	return rules;
};

export const confirmPasswordRules = (
	getValues: () => any,
	isRequired = true,
) => {
	const rules: any = {
		validate: (value: string) => {
			const password = getValues().password || getValues().new_password;
			return value === password ? true : "The passwords do not match";
		},
	};

	if (isRequired) {
		rules.required = "Password confirmation is required";
	}

	return rules;
};

export const handleError = (err: unknown) => {
	// Accept unknown first
	let title = "Something went wrong.";
	let description = "Please try again.";

	// Handle orval ErrorType / HTTPValidationError first
	if (err && typeof err === "object" && "detail" in err) {
		const errDetail = (err as HTTPValidationError).detail;
		title = "Validation Error";

		if (Array.isArray(errDetail)) {
			description = errDetail.map((e: any) => e.msg).join("; ");
		} else if (typeof errDetail === "string") {
			description = errDetail;
		}
		toast.error(title, { description });
		return;
	}

	// Handle AxiosError second (if you're still using raw axios somewhere)
	if (err && "response" in err && "status" in (err as any).response) {
		const axiosErr = err as AxiosError;
		const status = axiosErr.response?.status;

		if (status === 400 || status === 422) {
			title = status === 400 ? "Bad Request" : "Validation Error";
			if (axiosErr.response?.data?.detail) {
				const detail = axiosErr.response.data.detail;
				description = Array.isArray(detail)
					? detail.map((e: any) => e.msg).join("; ")
					: detail;
			}
		} else if (status === 401) {
			title = "Unauthorized";
			description = "Invalid username or password.";
		} else {
			title = `Server Error (${status})`;
			description =
				axiosErr.response?.data?.detail || "Server returned an error.";
		}
	}
	// Generic Error
	else if (err instanceof Error) {
		title = err.message;
	}

	toast.error(title, { description });
};
