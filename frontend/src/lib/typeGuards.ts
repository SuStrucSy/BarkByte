export function isNumericValue(value: unknown): value is number {
  return (
    typeof value === "number" && !Number.isNaN(value) && Number.isFinite(value)
  );
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
