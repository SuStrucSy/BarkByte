import type { SpecimenPublic } from "@/api/model";
import {
	EXPERIMENTAL_KEYS,
	getExperimentalLabel,
	getExperimentalUnit,
} from "@/lib/constants";
import { isMissingValue } from "@/lib/typeGuards";
import { getDisplayText, humanizeLabel } from "@/lib/utils";

type CompareRenderedValue = {
	text: string;
	isMissing: boolean;
};

const EXPERIMENTAL_KEY_SET = new Set<string>(EXPERIMENTAL_KEYS);

function getCompareLabel(key: keyof SpecimenPublic) {
	if (EXPERIMENTAL_KEY_SET.has(key)) {
		return getExperimentalLabel(key as (typeof EXPERIMENTAL_KEYS)[number]);
	}

	return humanizeLabel(key);
}

function getCompareUnit(key: keyof SpecimenPublic) {
	if (key === "moisture_percentage") {
		return "%";
	}

	if (EXPERIMENTAL_KEY_SET.has(key)) {
		return getExperimentalUnit(key as (typeof EXPERIMENTAL_KEYS)[number]);
	}

	return undefined;
}

function getMissingCompareText(key: keyof SpecimenPublic) {
	return `No ${getCompareLabel(key).toLowerCase()} information`;
}

// 🚨todo: parts of this feel duplicated, like it should be a general util
function formatCompareValue(value: unknown): string {
	if (value === null || value === undefined || value === "") {
		return "No value";
	}

	if (typeof value === "boolean") {
		return value ? "Yes" : "No";
	}

	if (typeof value === "string" || typeof value === "number") {
		return getDisplayText(value, "Unnamed");
	}

	if (Array.isArray(value)) {
		if (value.length === 0) {
			return "No value";
		}

		return value.map((item) => formatCompareValue(item)).join(", ");
	}

	if (typeof value === "object") {
		const record = value as Record<string, unknown>;

		if (typeof record.label === "string" && record.label.trim().length > 0) {
			return record.label;
		}

		if (
			typeof record.ref_title === "string" &&
			record.ref_title.trim().length > 0
		) {
			const authors =
				typeof record.authors === "string" && record.authors.trim().length > 0
					? ` (${record.authors})`
					: "";
			return `${record.ref_title}${authors}`;
		}

		return "Unnamed";
	}

	return "No value";
}

export function formatInlineCompareValue(
	key: keyof SpecimenPublic,
	value: unknown,
): CompareRenderedValue {
	if (isMissingValue(value)) {
		return { text: getMissingCompareText(key), isMissing: true };
	}

	if (key === "connector" && typeof value === "boolean") {
		return {
			text: value ? "has connector" : "has no connector",
			isMissing: false,
		};
	}

	if (key === "dowel" && typeof value === "boolean") {
		return { text: value ? "has dowel" : "has no dowel", isMissing: false };
	}


	// 🚨🚨🚨🚨 todo: we don't care about moisture percentage anymore, should it be removed?
	if (key === "moisture_percentage") {
		if (typeof value !== "string") {
			return { text: getMissingCompareText(key), isMissing: true };
		}

		const normalizedValue = value.trim();
		if (!normalizedValue) {
			return { text: getMissingCompareText(key), isMissing: true };
		}

		const percentPattern = /^\d+(\.\d+)?%?$/;
		if (!percentPattern.test(normalizedValue)) {
			return { text: getMissingCompareText(key), isMissing: true };
		}

		const displayValue = normalizedValue.endsWith("%")
			? normalizedValue
			: `${normalizedValue}%`;
		return { text: `${displayValue} moisture`, isMissing: false };
	}

	if (typeof value === "number") {
		const labelOverrides: Partial<Record<keyof SpecimenPublic, string>> = {
			fastener_numbers: "fasteners",
			replicate_tests: "replicate tests",
		};
		const label = (labelOverrides[key] ?? getCompareLabel(key)).toLowerCase();
		const unit = getCompareUnit(key);

		if (unit === "%") {
			return { text: `${value}% ${label}`, isMissing: false };
		}

		if (unit) {
			return { text: `${value} ${label} (${unit})`, isMissing: false };
		}

		return { text: `${value} ${label}`, isMissing: false };
	}

	return { text: formatCompareValue(value), isMissing: false };
}
