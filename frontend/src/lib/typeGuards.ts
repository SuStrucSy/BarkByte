export function isNumericValue(value: unknown): value is number {
	return (
		typeof value === "number" && !Number.isNaN(value) && Number.isFinite(value)
	);
}

const MISSING_STRING_VALUES = new Set(["", "—", "n/a", "na", "null", "none"]);

export function isMissingValue(value: unknown) {
	if (value === null || value === undefined) {
		return true;
	}

	if (typeof value === "string") {
		return MISSING_STRING_VALUES.has(value.trim().toLowerCase());
	}

	if (Array.isArray(value)) {
		return value.length === 0;
	}

	return false;
}

export function hasNumericProperty<K extends string>(
	obj: unknown,
	key: K,
): obj is Record<K, number> {
	return (
		typeof obj === "object" &&
		obj !== null &&
		key in obj &&
		isNumericValue((obj as Record<K, unknown>)[key])
	);
}
